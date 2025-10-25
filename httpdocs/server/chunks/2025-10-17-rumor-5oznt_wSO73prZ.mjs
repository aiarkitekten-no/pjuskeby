import { o as createVNode, F as Fragment, ay as __astro_tag_component__ } from './astro/server_YlAN3CX0.mjs';
import 'clsx';

const frontmatter = {
  "title": "Word around the bakery is that Percy Snootwhistle's peculiar peeling habit had finally driven him absolutely bananas, so much so that he'd started conversing with the yellow fruit, asking for their life stories before indulging a peel. The fresh-baked rumor was soon kneaded and rolled by the townsfolk of Pjuskeby, each adding their own flavor of absurdity.",
  "type": "rumor",
  "date": "2025-10-17T00:00:00.000Z",
  "characters": ["Percy Snootwhistle", "Trixie Wobblethorpe"],
  "locations": ["Ruckus Ridge"],
  "summary": "Word around the bakery is that Percy Snootwhistle's peculiar peeling habit had finally driven him absolutely bananas, so much so that he'd started con...",
  "published": true
};
function getHeadings() {
  return [];
}
function _createMdxContent(props) {
  const _components = {
    p: "p",
    ...props.components
  };
  return createVNode(Fragment, {
    children: [createVNode(_components.p, {
      children: "Word around the bakery is that Percy Snootwhistle’s peculiar peeling habit had finally driven him absolutely bananas, so much so that he’d started conversing with the yellow fruit, asking for their life stories before indulging a peel. The fresh-baked rumor was soon kneaded and rolled by the townsfolk of Pjuskeby, each adding their own flavor of absurdity."
    }), "\n", createVNode(_components.p, {
      children: "As the rumor rumbled down Twaddlefjord Terrace, it bumped into Trixie Wobblethorpe of Invisible Utensils Ltd. Trixie, the inventor of the invisible soup spoon, was known for her knack of making the invisible visible. She added her own twist to the tale. “Not just bananas, my dear,” she declared, “Percy’s been seen whispering to all sorts of fruits too! Apples, pears, and even the poor oranges!” The invisible soup spoon stirred the pot indeed."
    }), "\n", createVNode(_components.p, {
      children: "The chatter of Percy’s fruit chit-chats soon reached Ruckus Ridge, the perfect hilltop known for its chaotic picnics and ice cream rocket launches. The younglings, mouthful of ice cream, giggled and imagined Percy conducting symphonies with an orchestra of fruits. “And the bananas are the lead singers!” one squealed, adding another layer of silliness to the juicy rumor."
    }), "\n", createVNode(_components.p, {
      children: "Even the strong, silent types down at Krumplehorn Mechanics couldn’t resist the lure of this tantalizing tale. “Heard Percy’s building a fruit choir,” grumbled old mechanic, Lars, a smear of oil accenting his cheek. “Says he’s going to tour the world, put Pjuskeby on the map.”"
    }), "\n", createVNode(_components.p, {
      children: "A week since the rumor started, it had evolved from Percy holding cordial conversations with bananas to directing an all-fruit choir on a world tour. The town was abuzz with excitement and anticipation. Until one day, the truth was peeled, and it was far more mundane than the preposterous rumor."
    }), "\n", createVNode(_components.p, {
      children: "Percy Snootwhistle, sitting in his cozy home at The Slightly Odd Bank, was laughing heartily at the town’s wild imagination. “All I did was take a Babelfish language course,” he confessed to the town mayor. “I was practicing the different intonations using fruits as my audience. They seemed less likely to criticize my accents.”"
    }), "\n", createVNode(_components.p, {
      children: "The townsfolk of Pjuskeby were slightly disappointed, having looked forward to the first fruit choir world tour. However, they couldn’t help but chuckle at their collective creativity. And so, life in this whimsical Norwegian town returned to its delightful, unpeeled normalcy. Until the next rumor, of course!"
    })]
  });
}
function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = props.components || ({});
  return MDXLayout ? createVNode(MDXLayout, {
    ...props,
    children: createVNode(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent(props);
}

const url = "src/content/stories/2025-10-17-rumor-5oznt.mdx";
const file = "/var/www/vhosts/pjuskeby.org/src/content/stories/2025-10-17-rumor-5oznt.mdx";
const Content = (props = {}) => MDXContent({
  ...props,
  components: { Fragment: Fragment, ...props.components, },
});
Content[Symbol.for('mdx-component')] = true;
Content[Symbol.for('astro.needsHeadRendering')] = !Boolean(frontmatter.layout);
Content.moduleId = "/var/www/vhosts/pjuskeby.org/src/content/stories/2025-10-17-rumor-5oznt.mdx";
__astro_tag_component__(Content, 'astro:jsx');

export { Content, Content as default, file, frontmatter, getHeadings, url };
