import { Link } from 'react-router';
import { motion } from 'motion/react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-16 md:py-24">
      {/* animated gradient blobs */}
      <div aria-hidden className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-primary/30 to-secondary/20 blur-3xl opacity-60 animate-pulse pointer-events-none" />
      <div aria-hidden className="absolute -bottom-32 -right-24 w-[32rem] h-[32rem] rounded-full bg-gradient-to-br from-accent/20 to-primary/20 blur-3xl opacity-50 animate-pulse pointer-events-none" />

      <div className="relative max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 leading-tight">
              Nutrition guidance that understands your context
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Mazaj+ is a chat-driven, rule-based nutrition decision-support platform that provides personalized recommendations based on your unique profile, preferences, and health conditions.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/register" className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 text-center">
                Create Free Account
              </Link>
              <Link to="/login" className="px-8 py-3 bg-card text-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors text-center">
                Login
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            className="relative"
          >
            <div className="backdrop-blur-xl bg-card/80 dark:bg-white/5 rounded-2xl shadow-2xl p-6 border border-white/20">
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground mb-1">What should I eat for energy today?</p>
                    <span className="text-xs text-muted-foreground">2 min ago</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground text-xs font-semibold">M+</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground mb-2">Based on your profile, I recommend:</p>
                    <div className="bg-card rounded-lg p-3 border border-border">
                      <h4 className="text-sm font-medium mb-1">Oatmeal with Berries</h4>
                      <p className="text-xs text-muted-foreground mb-2">Complex carbs for sustained energy</p>
                      <div className="flex gap-2 text-xs">
                        <span className="px-2 py-1 bg-secondary/20 text-secondary-foreground rounded">High Fiber</span>
                        <span className="px-2 py-1 bg-secondary/20 text-secondary-foreground rounded">Allergy-Safe</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-accent/10 rounded-lg p-3 border border-accent/30">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-medium">Safety Check</span>
                  </div>
                  <p className="text-xs text-muted-foreground">No allergen conflicts</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-xs font-medium">Hydration</span>
                  </div>
                  <p className="text-xs text-muted-foreground">1.2L / 2.5L today</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}