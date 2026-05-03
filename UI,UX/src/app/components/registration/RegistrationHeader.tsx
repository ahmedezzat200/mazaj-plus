export function RegistrationHeader() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold">M+</span>
          </div>
          <span className="text-xl font-semibold text-foreground">Mazaj+</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">Already have an account?</span>
          <button className="px-5 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors">
            Login
          </button>
        </div>
      </div>
    </header>
  );
}
