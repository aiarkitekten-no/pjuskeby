class l extends HTMLElement{connectedCallback(){const a=this.getAttribute("src"),i=this.getAttribute("alt")||"Illustration by Agatha Splint",e=this.getAttribute("position")||"center";let t="margin: 2rem 0; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);";e==="left"?t+=" float: left; margin-right: 2rem; max-width: 400px;":e==="right"?t+=" float: right; margin-left: 2rem; max-width: 400px;":t+=" width: 100%; max-width: 700px; margin-left: auto; margin-right: auto; display: block;",this.innerHTML=`
            <figure style="${t}">
              <img src="${a}" alt="${i}" style="width: 100%; height: auto; display: block; border-radius: 12px;" loading="lazy" />
              <figcaption style="font-size: 0.85rem; color: #64748b; font-style: italic; text-align: center; margin-top: 0.5rem;">
                ${i}
              </figcaption>
            </figure>
          `}}customElements.get("agatha-illustration")||customElements.define("agatha-illustration",l);
