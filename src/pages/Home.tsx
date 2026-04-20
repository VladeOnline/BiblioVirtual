import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Library, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-16 w-16 text-amber-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Bienvenido a <span className="text-amber-400">BiblioVerse</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            Tu biblioteca digital personal. Descubre libros y mangas de todo el mundo, lee en linea y descarga tus favoritos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/books">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-8">
                <Library className="h-5 w-5 mr-2" />
                Explorar Libros
              </Button>
            </Link>
            <Link to="/mangas">
              <Button size="lg" className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-8">
                <Sparkles className="h-5 w-5 mr-2" />
                Explorar Mangas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">¿Que ofrece BiblioVerse?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Library className="h-10 w-10 text-amber-500" />}
              title="Biblioteca de Libros"
              description="Accede a una amplia coleccion de libros en PDF. Lee directamente en tu navegador o descarga para leer offline."
            />
            <FeatureCard
              icon={<Sparkles className="h-10 w-10 text-amber-500" />}
              title="Mangas por Capitulos"
              description="Disfruta de tus mangas favoritos organizados por capitulos. Navega facilmente entre ellos."
            />
            <FeatureCard
              icon={<BookOpen className="h-10 w-10 text-amber-500" />}
              title="Lector Integrado"
              description="Visualiza PDFs directamente en el navegador con nuestro lector integrado. Sin necesidad de descargar."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-16 px-4 bg-slate-100">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold text-slate-900">¿Comenzar a leer?</h2>
            <p className="text-slate-600">Registrate gratis y accede a todo nuestro contenido.</p>
            <div className="pt-3">
              <Link to="/register">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold">
                  Crear Cuenta Gratis
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
