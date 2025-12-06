import { motion } from "framer-motion";
import useMeasure from "react-use-measure";

interface AutoHeightAnimationWrapperProps {
  children: React.ReactNode;
  isTransitioning: boolean;
  duration?: number;
}

// use for height transitions, mainly popovers and dialogs
export default function AutoHeightAnimationWrapper({
  children,
  isTransitioning,
  duration = 0.5,
}: AutoHeightAnimationWrapperProps) {
  const [ref, bounds] = useMeasure();

  return (
    <motion.div
      initial={false}
      animate={
        isTransitioning
          ? { height: bounds.height > 0 ? bounds.height : "auto" }
          : {}
      }
      transition={{ type: "spring", duration, bounce: 0 }}
      style={!isTransitioning ? { height: "auto" } : undefined}
    >
      <div ref={ref}>{children}</div>
    </motion.div>
  );
}
