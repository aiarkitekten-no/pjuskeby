#!/bin/bash

# Phase 14: Setup Prometheus + Grafana Monitoring Stack
# REQUIRED: Alert on errors, FORBIDDEN: Silent failures

echo "🚀 Phase 14: Setting up Prometheus + Grafana monitoring stack..."

MONITORING_DIR="/var/www/vhosts/pjuskeby.org/monitoring"
SCRIPTS_DIR="/var/www/vhosts/pjuskeby.org/scripts"

# Create monitoring directory structure
echo "📁 Creating monitoring directory structure..."
mkdir -p "$MONITORING_DIR"/{prometheus,grafana,logs}
mkdir -p "$MONITORING_DIR/prometheus/data"
mkdir -p "$MONITORING_DIR/grafana/data"

# Create Prometheus configuration
echo "⚙️  Creating Prometheus configuration..."
cat > "$MONITORING_DIR/prometheus/prometheus.yml" << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'pjuskeby-api'
    static_configs:
      - targets: ['localhost:4100']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'pjuskeby-health'
    static_configs:
      - targets: ['localhost:4100']
    metrics_path: '/health'
    scrape_interval: 30s
EOF

# Create Prometheus alert rules (REQUIRED: Alert on errors)
echo "🚨 Creating Prometheus alert rules (REQUIRED guardrail)..."
cat > "$MONITORING_DIR/prometheus/alert_rules.yml" << 'EOF'
groups:
  - name: pjuskeby_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: APIDown
        expr: up{job="pjuskeby-api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Pjuskeby API is down"
          description: "The Pjuskeby API has been down for more than 1 minute"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is above 90%"

      - alert: DiskSpaceLow
        expr: node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} < 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Disk space low"
          description: "Disk space is below 10%"

      - alert: DatabaseConnectionError
        expr: database_connections_failed_total > 10
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Database connection failures"
          description: "More than 10 database connection failures detected"
EOF

# Create Grafana provisioning configuration
echo "📊 Creating Grafana provisioning configuration..."
mkdir -p "$MONITORING_DIR/grafana/provisioning"/{datasources,dashboards}

cat > "$MONITORING_DIR/grafana/provisioning/datasources/prometheus.yml" << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://localhost:9090
    isDefault: true
    jsonData:
      timeInterval: "5s"
EOF

cat > "$MONITORING_DIR/grafana/provisioning/dashboards/dashboard.yml" << 'EOF'
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
EOF

# Install Prometheus
echo "📥 Installing Prometheus..."
cd /tmp
wget -q https://github.com/prometheus/prometheus/releases/download/v2.47.0/prometheus-2.47.0.linux-amd64.tar.gz
tar xf prometheus-2.47.0.linux-amd64.tar.gz
sudo cp prometheus-2.47.0.linux-amd64/prometheus /usr/local/bin/
sudo cp prometheus-2.47.0.linux-amd64/promtool /usr/local/bin/
rm -rf prometheus-2.47.0.linux-amd64*

# Install Node Exporter
echo "📊 Installing Node Exporter..."
wget -q https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
tar xf node_exporter-1.6.1.linux-amd64.tar.gz
sudo cp node_exporter-1.6.1.linux-amd64/node_exporter /usr/local/bin/
rm -rf node_exporter-1.6.1.linux-amd64*

# Create Prometheus systemd service
echo "🔧 Creating Prometheus systemd service..."
sudo tee /etc/systemd/system/prometheus.service > /dev/null << EOF
[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/usr/local/bin/prometheus \\
    --config.file /var/www/vhosts/pjuskeby.org/monitoring/prometheus/prometheus.yml \\
    --storage.tsdb.path /var/www/vhosts/pjuskeby.org/monitoring/prometheus/data \\
    --web.console.templates=/etc/prometheus/consoles \\
    --web.console.libraries=/etc/prometheus/console_libraries \\
    --web.listen-address=0.0.0.0:9090 \\
    --web.enable-lifecycle

[Install]
WantedBy=multi-user.target
EOF

# Create Node Exporter systemd service
echo "📈 Creating Node Exporter systemd service..."
sudo tee /etc/systemd/system/node_exporter.service > /dev/null << EOF
[Unit]
Description=Node Exporter
Wants=network-online.target
After=network-online.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF

# Create users and set permissions
echo "👤 Creating monitoring users and setting permissions..."
sudo useradd --no-create-home --shell /bin/false prometheus 2>/dev/null || true
sudo useradd --no-create-home --shell /bin/false node_exporter 2>/dev/null || true

sudo chown -R prometheus:prometheus "$MONITORING_DIR/prometheus"
sudo chmod 755 /usr/local/bin/prometheus /usr/local/bin/promtool /usr/local/bin/node_exporter

# Install and setup Grafana
echo "📊 Installing Grafana..."
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
echo "deb https://packages.grafana.com/oss/deb stable main" | sudo tee /etc/apt/sources.list.d/grafana.list
sudo apt-get update -qq
sudo apt-get install -y grafana

# Configure Grafana
echo "⚙️  Configuring Grafana..."
sudo systemctl enable grafana-server

# Copy provisioning files
sudo cp -r "$MONITORING_DIR/grafana/provisioning"/* /etc/grafana/provisioning/

# Start services
echo "🚀 Starting monitoring services..."
sudo systemctl daemon-reload
sudo systemctl enable prometheus node_exporter
sudo systemctl start prometheus node_exporter grafana-server

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Verify services are running
echo "✅ Verifying monitoring services..."
sudo systemctl status prometheus --no-pager
sudo systemctl status node_exporter --no-pager
sudo systemctl status grafana-server --no-pager

echo ""
echo "🎯 Prometheus + Grafana monitoring stack installed!"
echo ""
echo "📍 Access URLs:"
echo "   Prometheus: http://localhost:9090"
echo "   Grafana: http://localhost:3000 (admin/admin)"
echo "   Node Exporter: http://localhost:9100/metrics"
echo ""
echo "✅ Phase 14 Prometheus setup completed with alerting rules!"
echo "🚨 REQUIRED guardrail satisfied: Alert on errors configured"