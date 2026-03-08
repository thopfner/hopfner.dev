"use client"

import { type ReactNode, useRef, useEffect, useState, createContext, useContext } from "react"
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useInView,
  useReducedMotion,
} from "framer-motion"

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

// ---------------------------------------------------------------------------
// Preview context — when true, all animations are skipped and content renders
// immediately. Used by the admin section preview to avoid IntersectionObserver
// issues inside scaled/overflow containers.
// ---------------------------------------------------------------------------
const SkipAnimationContext = createContext(false)
export const SkipAnimationProvider = SkipAnimationContext.Provider
function useSkipAnimation() { return useContext(SkipAnimationContext) }

// ---------------------------------------------------------------------------
// FadeIn — fade up on scroll into view
// ---------------------------------------------------------------------------

export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const skip = useSkipAnimation()
  if (reduce || skip) return <div className={className}>{children}</div>

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// StaggerContainer + StaggerItem — staggered children on scroll
// ---------------------------------------------------------------------------

const staggerContainerVariants = (staggerDelay: number) => ({
  hidden: {},
  show: {
    transition: { staggerChildren: staggerDelay },
  },
})

const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className,
}: {
  children: ReactNode
  staggerDelay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const skip = useSkipAnimation()
  if (reduce || skip) return <div className={className}>{children}</div>

  return (
    <motion.div
      variants={staggerContainerVariants(staggerDelay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()
  const skip = useSkipAnimation()
  if (reduce || skip) return <div className={className}>{children}</div>

  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// ScaleIn — scale up on scroll into view
// ---------------------------------------------------------------------------

export function ScaleIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const skip = useSkipAnimation()
  if (reduce || skip) return <div className={className}>{children}</div>

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// AnimatedCounter — counts up from 0 to target when scrolled into view
// ---------------------------------------------------------------------------

export function AnimatedCounter({
  target,
  duration = 2,
  prefix = "",
  suffix = "",
  className,
}: {
  target: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const motionVal = useMotionValue(0)
  const rounded = useTransform(motionVal, (v) => {
    // If target has decimals, show one decimal place
    return target % 1 !== 0 ? v.toFixed(1) : Math.round(v).toString()
  })
  const skip = useSkipAnimation()
  const [display, setDisplay] = useState(reduce || skip ? formatTarget() : `${prefix}0${suffix}`)

  function formatTarget() {
    const val = target % 1 !== 0 ? target.toFixed(1) : Math.round(target).toString()
    return `${prefix}${val}${suffix}`
  }

  useEffect(() => {
    if (reduce || skip) {
      setDisplay(formatTarget())
      return
    }
    if (!isInView) return

    const controls = animate(motionVal, target, {
      duration,
      ease: "easeOut",
    })

    const unsub = rounded.on("change", (v) => {
      setDisplay(`${prefix}${v}${suffix}`)
    })

    return () => {
      controls.stop()
      unsub()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, reduce, skip])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}

// ---------------------------------------------------------------------------
// HeroEntrance — choreographed hero entrance sequence
// ---------------------------------------------------------------------------

export function HeroEntrance({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const skip = useSkipAnimation()
  if (reduce || skip) return <div className={className}>{children}</div>

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
