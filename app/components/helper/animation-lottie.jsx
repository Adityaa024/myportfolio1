"use client";

import dynamic from "next/dynamic";

// Dynamically import Lottie with SSR disabled
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const AnimationLottie = ({ animationPath, width = "95%" }) => {
  return (
    <div style={{ width }}>
      <Lottie 
        animationData={animationPath} 
        loop={true} 
        autoplay={true} 
      />
    </div>
  );
};

export default AnimationLottie;
