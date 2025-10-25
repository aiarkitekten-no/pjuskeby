import { o as createVNode, F as Fragment, ay as __astro_tag_component__ } from './astro/server_YlAN3CX0.mjs';
import 'clsx';

const frontmatter = {
  "title": "Agatha's Diary Entry",
  "type": "agatha-diary",
  "date": "2025-10-17T00:00:00.000Z",
  "characters": ["Milly Wiggleflap", "Lola Fizzletwig"],
  "locations": ["Babblespray Falls"],
  "summary": "Dear Diary,\nAnother peculiar day in our dear Pjuskeby. You know, there's no other town where the clouds are met with such anticipation, and it's all ...",
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
      children: "Dear Diary,"
    }), "\n", createVNode(_components.p, {
      children: "Another peculiar day in our dear Pjuskeby. You know, there’s no other town where the clouds are met with such anticipation, and it’s all thanks to Milly Wiggleflap. She insists those clouds are just lazy sheep, grazing on the sky’s endless blue pasture. Today, she predicted strawberry mousse for tomorrow, from her Pudding Forecast Centre atop Wigglefang Way. I must say, her forecasts, though strange, are often strangely accurate. I still remember the day when a rain of custard filled my rain barrels. No one else can do what she does, and for that, she has my respect, however odd she might be."
    }), "\n", createVNode(_components.p, {
      children: "Speaking of oddities, Lola Fizzletwig added another hat to her collection today. She’s up to 38 now, not one of them fit for the Norwegian weather. I swear she owns a sombrero, a fez, and a Victorian bonnet, but not a single warm beanie. I suppose when you run Wiggle & Sons Millinery, practicality gives way to fashion, even in the face of Pjuskeby’s biting winters. Still, it’s always a spectacle to see which hat she’ll wear next."
    }), "\n", createVNode(_components.p, {
      children: "I stopped by Babblespray Falls today. You know, that waterfall is like our town’s personal chatterbox. It was whispering and gurgling as if it had the juiciest gossip to share. I don’t know if it’s the wind or the water, but it always sounds so eager to spill the beans. It’s a shame I can’t make out what it’s saying. Or perhaps it’s better, given my knack for eavesdropping."
    }), "\n", createVNode(_components.p, {
      children: "Finally, I ended my day at the Twirlybean Coffee & Chaos. True to its name, the place was in a frenzy. I think there were more cats than people. How they manage to keep the business afloat with such disorder is a mystery to me. Yet, I confess, I’m fond of the mayhem. There’s something charming about sipping steaming coffee amidst the sound of clattering cups and squawking parrots."
    }), "\n", createVNode(_components.p, {
      children: "Oh, Diary, what a peculiarly delightful town Pjuskeby is! Where else would you find a milliner who doesn’t own a practical hat, a waterfall that gossips, a weather forecaster who reads clouds like pudding and a café that thrives on chaos? Yet, beneath all its eccentricities, it’s the warmth of its people that makes this place truly special. And even though I grumble about it, I wouldn’t trade it for anything else."
    }), "\n", createVNode(_components.p, {
      children: "‘Til tomorrow, Diary. I wonder what absurdity awaits!\nYours,\nAgatha"
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

const url = "src/content/stories/2025-10-17-agatha-diary-mp435b.mdx";
const file = "/var/www/vhosts/pjuskeby.org/src/content/stories/2025-10-17-agatha-diary-mp435b.mdx";
const Content = (props = {}) => MDXContent({
  ...props,
  components: { Fragment: Fragment, ...props.components, },
});
Content[Symbol.for('mdx-component')] = true;
Content[Symbol.for('astro.needsHeadRendering')] = !Boolean(frontmatter.layout);
Content.moduleId = "/var/www/vhosts/pjuskeby.org/src/content/stories/2025-10-17-agatha-diary-mp435b.mdx";
__astro_tag_component__(Content, 'astro:jsx');

export { Content, Content as default, file, frontmatter, getHeadings, url };
