import{r as N,Q as w,U as z,W as o,j as v,X as k,a6 as E,Y as c,Z as U,b3 as W,aB as D,aC as R}from"./index-Czi6JP0w.js";const B=["className","color","disableShrink","size","style","thickness","value","variant"];let l=r=>r,P,b,S,$;const a=44,F=R(P||(P=l`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`)),I=R(b||(b=l`
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }

  100% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -125px;
  }
`)),K=r=>{const{classes:s,variant:e,color:t,disableShrink:d}=r,u={root:["root",e,`color${c(t)}`],svg:["svg"],circle:["circle",`circle${c(e)}`,d&&"circleDisableShrink"]};return U(u,W,s)},Z=k("span",{name:"MuiCircularProgress",slot:"Root",overridesResolver:(r,s)=>{const{ownerState:e}=r;return[s.root,s[e.variant],s[`color${c(e.color)}`]]}})(({ownerState:r,theme:s})=>o({display:"inline-block"},r.variant==="determinate"&&{transition:s.transitions.create("transform")},r.color!=="inherit"&&{color:(s.vars||s).palette[r.color].main}),({ownerState:r})=>r.variant==="indeterminate"&&D(S||(S=l`
      animation: ${0} 1.4s linear infinite;
    `),F)),G=k("svg",{name:"MuiCircularProgress",slot:"Svg",overridesResolver:(r,s)=>s.svg})({display:"block"}),L=k("circle",{name:"MuiCircularProgress",slot:"Circle",overridesResolver:(r,s)=>{const{ownerState:e}=r;return[s.circle,s[`circle${c(e.variant)}`],e.disableShrink&&s.circleDisableShrink]}})(({ownerState:r,theme:s})=>o({stroke:"currentColor"},r.variant==="determinate"&&{transition:s.transitions.create("stroke-dashoffset")},r.variant==="indeterminate"&&{strokeDasharray:"80px, 200px",strokeDashoffset:0}),({ownerState:r})=>r.variant==="indeterminate"&&!r.disableShrink&&D($||($=l`
      animation: ${0} 1.4s ease-in-out infinite;
    `),I)),V=N.forwardRef(function(s,e){const t=w({props:s,name:"MuiCircularProgress"}),{className:d,color:u="primary",disableShrink:_=!1,size:p=40,style:j,thickness:i=3.6,value:f=0,variant:x="indeterminate"}=t,M=z(t,B),n=o({},t,{color:u,disableShrink:_,size:p,thickness:i,value:f,variant:x}),h=K(n),m={},g={},C={};if(x==="determinate"){const y=2*Math.PI*((a-i)/2);m.strokeDasharray=y.toFixed(3),C["aria-valuenow"]=Math.round(f),m.strokeDashoffset=`${((100-f)/100*y).toFixed(3)}px`,g.transform="rotate(-90deg)"}return v.jsx(Z,o({className:E(h.root,d),style:o({width:p,height:p},g,j),ownerState:n,ref:e,role:"progressbar"},C,M,{children:v.jsx(G,{className:h.svg,ownerState:n,viewBox:`${a/2} ${a/2} ${a} ${a}`,children:v.jsx(L,{className:h.circle,style:m,ownerState:n,cx:a,cy:a,r:(a-i)/2,fill:"none",strokeWidth:i})})}))});export{V as C};
