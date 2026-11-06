// The country flip. Each country is a separate page, so the flip is a cross-document view transition:
// the browser holds the old page, loads the new one, and these rules turn one into the other. It costs
// no JavaScript on load and no WebGL, and keeps the other country out of this page's HTML.
// Both are inlined by <Page>, so only the two country pages opt in.

const SPIN = (mode: "in" | "ae") => {
  const out = mode === "ae" ? -90 : 90;
  return `
@keyframes n-flip-out { to { transform: rotateY(${out}deg) scale(.92); } }
@keyframes n-flip-in { from { transform: rotateY(${-out}deg) scale(.92); } }`;
};

export const flipCss = (mode: "in" | "ae") => `
@media (prefers-reduced-motion: no-preference) {
  @view-transition { navigation: auto; }
  ::view-transition { background: #0B0B0C; }
  ::view-transition-image-pair(root) { perspective: 1400px; isolation: auto; }
  ::view-transition-old(root) { animation: n-flip-out .3s cubic-bezier(.55,0,.8,.4) both; mix-blend-mode: normal; backface-visibility: hidden; }
  ::view-transition-new(root) { animation: n-flip-in .34s cubic-bezier(.16,1,.3,1) .3s both; mix-blend-mode: normal; backface-visibility: hidden; }
  ${SPIN(mode)}
}`;

/**
 * Runs before first paint. Marks low-end devices (.n-lite turns every 3D effect off), cancels the flip
 * there and on any navigation that is not a change of country, and half-flips by hand in browsers that
 * have no cross-document transitions.
 */
export const flipScript = `(function(){
var d=document,r=d.documentElement,n=navigator;
var lite=(n.deviceMemory&&n.deviceMemory<=2)||(n.hardwareConcurrency&&n.hardwareConcurrency<=2)||(n.connection&&n.connection.saveData);
if(lite)r.classList.add('n-lite');
var still=matchMedia('(prefers-reduced-motion: reduce)').matches;
var link=d.querySelector.bind(d,'[data-flip-link]');
if('onpagereveal' in window){
 addEventListener('pageswap',function(e){if(!e.viewTransition)return;var to=e.activation&&e.activation.entry&&e.activation.entry.url;
  var l=link();if(lite||!l||l.href!==to)e.viewTransition.skipTransition()});
 addEventListener('pagereveal',function(e){if(e.viewTransition&&lite)e.viewTransition.skipTransition()});
 return}
if(lite||still)return;
d.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('[data-flip-link]');
 if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;
 e.preventDefault();r.classList.add('n-flipping');setTimeout(function(){location.href=a.href},260)});
addEventListener('pageshow',function(){r.classList.remove('n-flipping')});
})()`;
