import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [glitchActive, setGlitchActive] = useState(false);
  const [typedText, setTypedText] = useState("");
  const fullText = "Create 3D games with natural language_";

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 80);

    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 3000);

    return () => {
      clearInterval(typingInterval);
      clearInterval(glitchInterval);
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');

        .page-container {
          font-family: 'IBM Plex Mono', monospace;
          min-height: 100vh;
          background: #0a0a0f;
          position: relative;
          overflow: hidden;
        }

        /* Animated grid background */
        .grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0, 255, 157, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 157, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridScroll 20s linear infinite;
        }

        @keyframes gridScroll {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        /* CRT scanlines */
        .scanlines {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            transparent 50%,
            rgba(0, 0, 0, 0.3) 50%
          );
          background-size: 100% 4px;
          pointer-events: none;
          animation: scan 8s linear infinite;
        }

        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }

        /* Vignette effect */
        .vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at center,
            transparent 0%,
            rgba(0, 0, 0, 0.7) 100%
          );
          pointer-events: none;
        }

        .content-wrapper {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 2rem;
        }

        /* Glitch effect on title */
        .glitch {
          font-size: clamp(2.5rem, 10vw, 7rem);
          font-weight: 700;
          line-height: 1;
          color: #00ff9d;
          text-transform: uppercase;
          letter-spacing: -0.05em;
          position: relative;
          text-shadow:
            0 0 20px rgba(0, 255, 157, 0.5),
            0 0 40px rgba(0, 255, 157, 0.3);
          margin-bottom: 3rem;
        }

        .glitch.active::before,
        .glitch.active::after {
          content: attr(data-text);
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
        }

        .glitch.active::before {
          color: #ff00ff;
          animation: glitchBefore 0.3s infinite;
          clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
        }

        .glitch.active::after {
          color: #00ffff;
          animation: glitchAfter 0.3s infinite;
          clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
        }

        @keyframes glitchBefore {
          0% { transform: translate(0); }
          20% { transform: translate(-3px, 3px); }
          40% { transform: translate(-3px, -3px); }
          60% { transform: translate(3px, 3px); }
          80% { transform: translate(3px, -3px); }
          100% { transform: translate(0); }
        }

        @keyframes glitchAfter {
          0% { transform: translate(0); }
          20% { transform: translate(3px, -3px); }
          40% { transform: translate(3px, 3px); }
          60% { transform: translate(-3px, -3px); }
          80% { transform: translate(-3px, 3px); }
          100% { transform: translate(0); }
        }

        /* Terminal typing effect */
        .terminal-text {
          font-size: clamp(1rem, 3vw, 1.5rem);
          color: #8b8b9f;
          margin-bottom: 4rem;
          min-height: 3rem;
          font-weight: 400;
        }

        .terminal-text::after {
          content: '█';
          color: #00ff9d;
          animation: blink 1s step-end infinite;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        /* Neon buttons */
        .btn-primary {
          position: relative;
          padding: 1.5rem 4rem;
          font-size: 1.5rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #0a0a0f;
          background: #00ff9d;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          clip-path: polygon(
            10px 0, 100% 0, 100% calc(100% - 10px),
            calc(100% - 10px) 100%, 0 100%, 0 10px
          );
          box-shadow:
            0 0 20px rgba(0, 255, 157, 0.5),
            inset 0 0 20px rgba(0, 255, 157, 0.2);
        }

        .btn-primary:hover {
          background: #00ffff;
          box-shadow:
            0 0 40px rgba(0, 255, 255, 0.8),
            inset 0 0 30px rgba(0, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .btn-secondary {
          margin-top: 2rem;
          padding: 1rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          color: #ff00ff;
          background: transparent;
          border: 2px solid #ff00ff;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          clip-path: polygon(
            8px 0, 100% 0, 100% calc(100% - 8px),
            calc(100% - 8px) 100%, 0 100%, 0 8px
          );
        }

        .btn-secondary:hover {
          background: #ff00ff;
          color: #0a0a0f;
          box-shadow: 0 0 30px rgba(255, 0, 255, 0.6);
          transform: translateX(5px);
        }

        /* Decorative elements */
        .corner-accent {
          position: fixed;
          width: 200px;
          height: 200px;
          border: 2px solid rgba(0, 255, 157, 0.2);
          pointer-events: none;
        }

        .corner-top-left {
          top: 0;
          left: 0;
          border-right: none;
          border-bottom: none;
        }

        .corner-bottom-right {
          bottom: 0;
          right: 0;
          border-left: none;
          border-top: none;
        }

        .pixel-decoration {
          position: absolute;
          width: 20px;
          height: 20px;
          background: #00ff9d;
          opacity: 0.3;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .pixel-1 { top: 20%; left: 10%; animation-delay: 0s; }
        .pixel-2 { top: 60%; right: 15%; animation-delay: 1s; }
        .pixel-3 { bottom: 20%; left: 20%; animation-delay: 2s; background: #ff00ff; }
        .pixel-4 { top: 40%; right: 25%; animation-delay: 1.5s; background: #00ffff; }
      `}</style>

      <div className="page-container">
        {/* Background layers */}
        <div className="grid-bg" />
        <div className="scanlines" />
        <div className="vignette" />

        {/* Corner accents */}
        <div className="corner-accent corner-top-left" />
        <div className="corner-accent corner-bottom-right" />

        {/* Floating pixels */}
        <div className="pixel-decoration pixel-1" />
        <div className="pixel-decoration pixel-2" />
        <div className="pixel-decoration pixel-3" />
        <div className="pixel-decoration pixel-4" />

        {/* Main content */}
        <div className="content-wrapper">
          <h1
            className={`glitch ${glitchActive ? 'active' : ''}`}
            data-text="AI GAME PLATFORM"
          >
            AI GAME PLATFORM
          </h1>

          <p className="terminal-text">
            {typedText}
          </p>

          <button
            onClick={() => navigate("/editor")}
            className="btn-primary"
          >
            &gt; Launch Editor
          </button>

          <button
            onClick={() => navigate("/runtime")}
            className="btn-secondary"
          >
            View Runtime Demo
          </button>
        </div>
      </div>
    </>
  );
}
