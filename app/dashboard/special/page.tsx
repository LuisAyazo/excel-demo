'use client';

import { useState, useEffect, useRef } from 'react';

export default function SpecialPage() {
  const [mode, setMode] = useState<'normal' | 'party'>('normal');
  const [confetti, setConfetti] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const [quotes, setQuotes] = useState<string[]>([
    "¡Ay mi madre, el bicho!",
    "Un besito y pa' la cama",
    "La que has liaooo pollito",
    "¡Como está el panorama María!",
    "A darle caña al Permatrago",
    "Te queremos Luismi, aunque estés loca",
    "¡Me parto y me mondooo!",
    "Ay, qué locura de página",
    "Esto sí que es un Easter Egg del bueno",
    "¿Alguien ha visto mi cordura? La perdí haciendo esta página"
  ]);
  const [currentQuote, setCurrentQuote] = useState<string>("");
  
  useEffect(() => {
    // Crear elemento de audio
    audioRef.current = new Audio('/party-horn.mp3');
    
    // Cambiar cita cada 5 segundos en modo fiesta
    let interval: NodeJS.Timeout;
    
    if (mode === 'party') {
      // Iniciar con una cita aleatoria
      getRandomQuote();
      
      interval = setInterval(() => {
        getRandomQuote();
      }, 3000);
      
      // Lanzar confeti
      setConfetti(true);
      
      // Reproducir sonido
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log("Error reproduciendo audio:", e));
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [mode]);

  // Efecto de confeti
  useEffect(() => {
    if (!confetti || !confettiCanvasRef.current) return;
    
    const canvas = confettiCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Configurar tamaño del canvas
    const resizeCanvas = () => {
      if (canvas && ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Definir partículas de confeti
    const particles: {
      x: number;
      y: number;
      size: number;
      color: string;
      velX: number;
      velY: number;
      radian: number;
      opacity: number;
    }[] = [];
    
    // Generar partículas
    const createParticles = () => {
      const particleCount = 100;
      const colors = ['#FFA500', '#FFD700', '#FF8C00', '#FF69B4', '#FF1493', '#00BFFF', '#1E90FF', '#7B68EE'];
      
      for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * 10 + 5;
        
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          size,
          color: colors[Math.floor(Math.random() * colors.length)],
          velX: Math.random() * 6 - 3,
          velY: Math.random() * 3 + 2,
          radian: Math.random() * Math.PI * 2,
          opacity: 1
        });
      }
    };
    
    // Dibujar y actualizar partículas
    const updateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Dibujar partícula
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${hexToRgb(p.color)}, ${p.opacity})`;
        ctx.fill();
        
        // Actualizar posición
        p.x += p.velX;
        p.y += p.velY;
        p.radian += 0.02;
        p.opacity -= 0.005;
        
        // Remover partículas que desaparecen o salen de la pantalla
        if (p.opacity <= 0 || p.y > canvas.height) {
          particles.splice(i, 1);
          i--;
        }
      }
      
      // Añadir nuevas partículas si es necesario
      if (particles.length < 50 && mode === 'party') {
        createParticles();
      }
      
      if (mode === 'party') {
        requestAnimationFrame(updateParticles);
      }
    };
    
    // Función auxiliar para convertir hex a rgb
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '255, 255, 255';
    };
    
    createParticles();
    updateParticles();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [confetti, mode]);

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setCurrentQuote(quotes[randomIndex]);
  };

  const togglePartyMode = () => {
    setMode(prev => prev === 'normal' ? 'party' : 'normal');
  };

  return (
    <div className="space-y-8">
      {/* Canvas para el confeti */}
      <canvas
        ref={confettiCanvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
      />

      {/* Contenido principal */}
      <div className={`bg-white rounded-lg shadow-sm p-8 text-center transition-all duration-500 ${mode === 'party' ? 'bg-gradient-to-r from-pink-400 via-primary to-purple-500' : ''}`}>
        <h2 className={`text-3xl font-bold mb-6 ${mode === 'party' ? 'text-white animate-bounce' : 'text-secondary'}`}>
          La Loca de Luismi
        </h2>
        
        {mode === 'normal' ? (
          <div className="space-y-6">
            <p className="text-gray-600">
              Has descubierto una página secreta... ¿Te atreves a averiguar qué hay detrás del botón?
            </p>
            
            <div className="p-6 border-2 border-dashed border-primary rounded-lg">
              <img 
                src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHAzZnNvaDV0aW5uNmJ6NmsxbXUxcDB1emFpcW5qMTltcnd5ZjBkdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7527pa7qs9kCG78A/giphy.gif" 
                alt="Thinking emoji" 
                className="w-32 h-32 mx-auto my-6 rounded-full"
              />
              
              <button
                onClick={togglePartyMode}
                className="mt-4 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-full transition-colors transform hover:scale-105 flex items-center justify-center mx-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
                ¡Modo Fiesta!
              </button>
            </div>
            
            <p className="text-sm text-gray-500">
              Advertencia: Este botón puede desatar la locura. Pulsa bajo tu propia responsabilidad.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cita aleatoria con animación */}
            <div className="h-20">
              <p className="text-white text-xl font-bold animate-pulse">
                {currentQuote}
              </p>
            </div>
            
            {/* GIFs locos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
              <img 
                src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNGU1Z2d6OGZzbmNvb3Q5cWJucDJtMTFkNXNoY3d2ZHk2cnBrczQ4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/blSTtZehjAZ8I/giphy.gif" 
                alt="Party gif 1" 
                className="w-full h-40 object-cover rounded-lg transform hover:rotate-3 transition-transform"
              />
              <img 
                src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjhwY3B1YTh0MXFmNDYzOGJ1ODQ4a3B6cWF1dmIzeXNxbnVydDNnaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l2JJyhAVvVGD3Qv5e/giphy.gif" 
                alt="Party gif 2" 
                className="w-full h-40 object-cover rounded-lg transform hover:-rotate-3 transition-transform"
              />
              <img 
                src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGp1OXN3bjdsN2FqZmsxejN6NHZmOGd5Zmo1bTB5enNtZW1oMnR0ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l2JIdnF6aJnAqSTJe/giphy.gif" 
                alt="Party gif 3" 
                className="w-full h-40 object-cover rounded-lg transform hover:rotate-3 transition-transform"
              />
            </div>
            
            <button
              onClick={togglePartyMode}
              className="mt-4 px-6 py-3 bg-white text-primary hover:bg-gray-100 font-medium rounded-full transition-colors transform hover:scale-105 flex items-center justify-center mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Volver a la normalidad
            </button>
          </div>
        )}
      </div>
      
      {/* Tarjeta informativa */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-secondary mb-4">¿Por qué "La Loca de Luismi"?</h3>
        <p className="text-gray-600 mb-4">
          Esta página es un pequeño homenaje al sentido del humor y la creatividad. A veces, en medio de un proyecto serio,
          necesitamos un espacio para la diversión y la locura. ¡Todos tenemos un poco de "Luismi" dentro!
        </p>
        <p className="text-gray-600">
          Y recuerda: "La creatividad requiere tener el valor de desprenderse de las certezas" - Erich Fromm
        </p>
      </div>
    </div>
  );
}