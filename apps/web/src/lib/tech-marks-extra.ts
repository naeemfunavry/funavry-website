import type { TechMark } from "./tech-marks";

/**
 * Brand marks no Iconify set carries, vendored by hand so they survive a run
 * of scripts/gen-tech-marks.mjs, which rewrites tech-marks.ts whole.
 *
 * Source: LobeHub's AI brand icons, @lobehub/icons-static-svg (MIT), which
 * collects the official artwork. Gradient ids are renamed to a site-specific
 * prefix so they can't collide with anything else on the page.
 *
 * LoRA and QLoRA are techniques from research papers, not products, so no
 * mark exists; theirs are drawn for this site: a low-rank bottleneck (two
 * wedges meeting at a bar) wired into a network, and for QLoRA the same with
 * a quantised grid badge.
 */
export const TECH_MARKS_EXTRA: Record<string, TechMark> = {
  // @lobehub/icons-static-svg 1.95.1, icons/llamaindex-color.svg
  LlamaIndex: {
    w: 24,
    h: 24,
    body: '<path d="M15.855 17.122c-2.092.924-4.358.545-5.23.24 0 .21-.01.857-.048 1.78-.038.924-.332 1.507-.475 1.684.016.577.029 1.837-.047 2.26a1.93 1.93 0 01-.476.914H8.295c.114-.577.555-.946.761-1.058.114-1.193-.11-2.229-.238-2.597-.126.449-.437 1.49-.665 2.068a6.418 6.418 0 01-.713 1.299h-.951c-.048-.578.27-.77.475-.77.095-.177.323-.731.476-1.54.152-.807-.064-2.324-.19-2.981v-2.068c-1.522-.818-2.092-1.636-2.473-2.55-.304-.73-.222-1.843-.142-2.308-.096-.176-.373-.625-.476-1.25-.142-.866-.063-1.491 0-1.828-.095-.096-.285-.587-.285-1.78 0-1.192.349-1.811.523-1.972v-.529c-.666-.048-1.331-.336-1.712-.721-.38-.385-.095-.962.143-1.154.238-.193.475-.049.808-.145.333-.096.618-.192.76-.48C4.512 1.403 4.287.448 4.16 0c.57.077.935.577 1.046.818V0c.713.337 1.997 1.154 2.425 2.934.342 1.424.586 4.409.665 5.723 1.823.016 4.137-.26 6.229.193 1.901.412 2.757 1.25 3.755 1.25.999 0 1.57-.577 2.282-.096.714.481 1.094 1.828.999 2.838-.076.808-.697 1.074-.998 1.106-.38 1.27 0 2.485.237 2.934v1.827c.111.16.333.655.333 1.347 0 .693-.222 1.154-.333 1.299.19 1.077-.08 2.18-.238 2.597h-1.283c.152-.385.412-.481.523-.481.228-1.193.063-2.293-.048-2.693-.722-.424-1.188-1.17-1.331-1.491.016.272-.029 1.029-.333 1.875-.304.847-.76 1.347-.95 1.491v1.01h-1.284c0-.615.348-.737.523-.721.222-.4.76-1.01.76-2.212 0-1.015-.713-1.492-1.236-2.405-.248-.434-.127-.978-.047-1.203z" fill="url(#tm-llamaindex)"/><defs><linearGradient gradientUnits="userSpaceOnUse" id="tm-llamaindex" x1="4.021" x2="24.613" y1="2.02" y2="19.277"><stop offset=".062" stop-color="#F6DCD9"/><stop offset=".326" stop-color="#FFA5EA"/><stop offset=".589" stop-color="#45DFF8"/><stop offset="1" stop-color="#BC8DEB"/></linearGradient></defs>',
  },
  // Drawn for this site: the low-rank bottleneck between two layers of nodes.
  LoRA: {
    w: 60,
    h: 36,
    body: '<path d="M8.4 8 L18 12 M51.6 8 L42 12" stroke="#0F1F5C" stroke-width="1.5" stroke-linecap="round"/><path d="M8.4 18 L18 18 M51.6 18 L42 18" stroke="#0F1F5C" stroke-width="1.5" stroke-linecap="round"/><path d="M8.4 28 L18 24 M51.6 28 L42 24" stroke="#0F1F5C" stroke-width="1.5" stroke-linecap="round"/><circle cx="5" cy="8" r="3.4" fill="#86ABF7" stroke="#0F1F5C" stroke-width="1.5"/><circle cx="55" cy="8" r="3.4" fill="#86ABF7" stroke="#0F1F5C" stroke-width="1.5"/><circle cx="5" cy="18" r="3.4" fill="#86ABF7" stroke="#0F1F5C" stroke-width="1.5"/><circle cx="55" cy="18" r="3.4" fill="#86ABF7" stroke="#0F1F5C" stroke-width="1.5"/><circle cx="5" cy="28" r="3.4" fill="#86ABF7" stroke="#0F1F5C" stroke-width="1.5"/><circle cx="55" cy="28" r="3.4" fill="#86ABF7" stroke="#0F1F5C" stroke-width="1.5"/><defs><linearGradient id="tm-lora" x1="18" y1="6" x2="42" y2="30" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3B82F0"/><stop offset="1" stop-color="#4A2BD4"/></linearGradient></defs><rect x="18" y="6" width="24" height="24" rx="4.5" fill="url(#tm-lora)"/><path d="M22 11.5 L28.2 14.8 V21.2 L22 24.5 Z M38 11.5 L31.8 14.8 V21.2 L38 24.5 Z" fill="#E3EAF9"/><rect x="29.3" y="14.8" width="1.4" height="6.4" rx=".4" fill="#E3EAF9"/>',
  },
  // The same, with a 3x3 badge for the quantised weights.
  QLoRA: {
    w: 60,
    h: 36,
    body: '<path d="M8.4 8 L18 12 M51.6 8 L42 12" stroke="#0F1F5C" stroke-width="1.5" stroke-linecap="round"/><path d="M8.4 18 L18 18 M51.6 18 L42 18" stroke="#0F1F5C" stroke-width="1.5" stroke-linecap="round"/><path d="M8.4 28 L18 24 M51.6 28 L42 24" stroke="#0F1F5C" stroke-width="1.5" stroke-linecap="round"/><circle cx="5" cy="8" r="3.4" fill="#86ABF7" stroke="#0F1F5C" stroke-width="1.5"/><circle cx="55" cy="8" r="3.4" fill="#86ABF7" stroke="#0F1F5C" stroke-width="1.5"/><circle cx="5" cy="18" r="3.4" fill="#86ABF7" stroke="#0F1F5C" stroke-width="1.5"/><circle cx="55" cy="18" r="3.4" fill="#86ABF7" stroke="#0F1F5C" stroke-width="1.5"/><circle cx="5" cy="28" r="3.4" fill="#86ABF7" stroke="#0F1F5C" stroke-width="1.5"/><circle cx="55" cy="28" r="3.4" fill="#86ABF7" stroke="#0F1F5C" stroke-width="1.5"/><defs><linearGradient id="tm-qlora" x1="18" y1="6" x2="42" y2="30" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3B82F0"/><stop offset="1" stop-color="#4A2BD4"/></linearGradient></defs><rect x="18" y="6" width="24" height="24" rx="4.5" fill="url(#tm-qlora)"/><path d="M22 11.5 L28.2 14.8 V21.2 L22 24.5 Z M38 11.5 L31.8 14.8 V21.2 L38 24.5 Z" fill="#E3EAF9"/><rect x="29.3" y="14.8" width="1.4" height="6.4" rx=".4" fill="#E3EAF9"/><rect x="36.2" y="20.2" width="14.6" height="14.6" rx="3.2" fill="#0F1F5C" stroke="#3E8BF0" stroke-width="1.4"/><rect x="38.4" y="22.4" width="2.6" height="2.6" rx=".5" fill="#0EA5F0"/><rect x="42" y="22.4" width="2.6" height="2.6" rx=".5" fill="#DDE5F3"/><rect x="45.6" y="22.4" width="2.6" height="2.6" rx=".5" fill="#0EA5F0"/><rect x="38.4" y="26" width="2.6" height="2.6" rx=".5" fill="#DDE5F3"/><rect x="42" y="26" width="2.6" height="2.6" rx=".5" fill="#0EA5F0"/><rect x="45.6" y="26" width="2.6" height="2.6" rx=".5" fill="#DDE5F3"/><rect x="38.4" y="29.6" width="2.6" height="2.6" rx=".5" fill="#0EA5F0"/><rect x="42" y="29.6" width="2.6" height="2.6" rx=".5" fill="#DDE5F3"/><rect x="45.6" y="29.6" width="2.6" height="2.6" rx=".5" fill="#0EA5F0"/>',
  },
};
