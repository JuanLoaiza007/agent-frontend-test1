/**
 * Footer component - Fixed at the bottom
 */
export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-md py-2">
      <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
        <p>
          Información sujeta a verificación. La Universidad del Valle no ha
          desarrollado este sistema ni se responsabiliza por su contenido.
        </p>
      </div>
    </footer>
  );
}
