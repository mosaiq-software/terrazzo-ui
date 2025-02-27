import React, { DependencyList, EffectCallback, useEffect } from "react"

export const useEffectStrict = (effect: EffectCallback, deps?: DependencyList) => {
    return useEffect(()=>{
        let strictIgnore = false;
        if(strictIgnore){
            return;
        }
        effect();
        return () => {
            strictIgnore = true;
        }
    }, deps);
}