/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
export function MenuHero({src,alt}:{src:string;alt:string}){const [image,setImage]=useState(src);return <div style={{position:"relative",aspectRatio:"4/3",borderRadius:12,overflow:"hidden",background:"var(--soft)"}}><img src={image} alt={alt} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={()=>setImage("https://www.themealdb.com/images/media/meals/1549542994.jpg")}/></div>}
