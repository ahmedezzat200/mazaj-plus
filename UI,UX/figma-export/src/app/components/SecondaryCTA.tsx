export function SecondaryCTA() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-primary/5">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Ready to Start Your Nutrition Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join Mazaj+ today and receive personalized, profile-aware nutrition guidance that understands your unique needs and goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow-md">
              Create Free Account
            </button>
            <button className="px-8 py-3 text-primary hover:underline">
              Already have an account? Login
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
