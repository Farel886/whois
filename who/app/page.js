"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTransform, useMotionValue, useSpring } from "framer-motion";

// Komponen untuk efek tilt 3D
const TiltCard = ({ children, className = "" }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);
  
  const handleMouseMove = (e) => {
    const rect = e.target.getBoundingClientRect();
    
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Scroll smooth ke section
const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Track mouse position for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "⚠️ Server error" }]);
    }
  };

  // Calculate parallax effect
  const calculateParallax = (speed) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    return {
      x: (mousePosition.x - centerX) * speed,
      y: (mousePosition.y - centerY) * speed,
    };
  };

  return (
    <div 
      ref={containerRef}
      className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 text-white min-h-screen overflow-hidden"
      style={{ perspective: "1000px" }}
    >
      {/* 3D Background Elements */}
      <div className="fixed inset-0 overflow-hidden z-0">
        {/* Animated particles */}
        {[...Array(15)].map((_, i) => {
          const size = Math.random() * 20 + 5;
          const parallax = calculateParallax(0.003);
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                width: size,
                height: size,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                x: parallax.x * (i % 2 ? 1 : -1),
                y: parallax.y * (i % 2 ? 1 : -1),
              }}
              animate={{
                y: [0, Math.random() * 30 - 15],
                x: [0, Math.random() * 30 - 15],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: Math.random() * 5 + 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          );
        })}
        
        {/* Floating shapes */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-40 h-40 border-2 border-pink-400/30 rounded-lg"
          style={{
            ...calculateParallax(0.01),
            transformStyle: "preserve-3d",
            rotate: "45deg",
          }}
          animate={{
            rotateY: [0, 180, 360],
            rotateX: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <motion.div
          className="absolute bottom-1/3 right-1/3 w-32 h-32 border-2 border-indigo-400/30 rounded-full"
          style={{
            ...calculateParallax(0.015),
            transformStyle: "preserve-3d",
          }}
          animate={{
            rotateZ: [0, 180, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Navbar */}
      <motion.header 
        className="fixed top-0 left-0 w-full bg-white/10 backdrop-blur-md shadow-lg z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7 }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <motion.div 
            className="text-xl font-bold"
            whileHover={{ scale: 1.05 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
              🤖 Farrel AI
            </span>
          </motion.div>
          <ul className="flex gap-6 text-sm font-medium">
            {["home", "about", "project", "chat", "contact"].map((item) => (
              <motion.li key={item} whileHover={{ y: -2 }} style={{ transformStyle: "preserve-3d" }}>
                <button 
                  onClick={() => scrollToSection(item)} 
                  className="hover:text-indigo-300 capitalize"
                >
                  {item}
                </button>
              </motion.li>
            ))}
          </ul>
        </nav>
      </motion.header>

      {/* Sections */}
      <main className="relative z-10 mt-20">
        {/* Home Section */}
        <section 
          id="home" 
          className="h-screen flex flex-col justify-center items-center text-center px-6 relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div 
            className="absolute inset-0 flex items-center justify-center opacity-20"
            style={{
              ...calculateParallax(0.02),
              transformStyle: "preserve-3d",
            }}
          >
            <div className="text-[20rem]">🤖</div>
          </div>
          
          <TiltCard className="bg-gradient-to-br from-indigo-500/20 to-pink-500/20 p-8 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl">
            <motion.h1 
              initial={{ opacity: 0, y: -30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 1 }}
              className="text-5xl md:text-6xl font-bold mb-6"
              style={{ transformStyle: "preserve-3d" }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
                Welcome to My Portfolio
              </span>
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-200 max-w-xl mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              style={{ transform: "translateZ(20px)" }}
            >
              Explore my works, chat with AI, and get to know me better!
            </motion.p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection("chat")}
              className="bg-gradient-to-r from-pink-500 to-indigo-500 px-6 py-3 rounded-full font-medium shadow-lg"
              style={{ transformStyle: "preserve-3d" }}
            >
              Start Chatting
            </motion.button>
          </TiltCard>
        </section>

        {/* About Section */}
        <section 
          id="about" 
          className="h-screen flex flex-col justify-center items-center px-6 relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="max-w-4xl mx-auto">
            <motion.h2 
              className="text-4xl font-bold mb-10 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">Me</span>
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <TiltCard className="bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl h-full">
                <div className="text-center" style={{ transform: "translateZ(30px)" }}>
                  <div className="w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                    <div className="w-full h-full bg-gradient-to-br from-pink-400 to-indigo-400 flex items-center justify-center text-5xl">
                      🚀
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Farrel Developer</h3>
                  <p className="text-gray-300">AI & 3D Enthusiast</p>
                </div>
              </TiltCard>
              
              <TiltCard className="bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl h-full">
                <div style={{ transform: "translateZ(30px)" }}>
                  <h3 className="text-2xl font-bold mb-4">My Skills</h3>
                  <ul className="space-y-3">
                    {["AI Development", "3D Modeling", "Web Design", "React/Next.js", "Machine Learning"].map((skill, i) => (
                      <motion.li 
                        key={i}
                        className="flex items-center"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <span className="mr-2 text-pink-400">▹</span> {skill}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </TiltCard>
            </div>
          </div>
        </section>

        {/* Project Section */}
        <section 
          id="project" 
          className="min-h-screen flex flex-col justify-center items-center px-6 py-20 relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="max-w-6xl mx-auto w-full">
            <motion.h2 
              className="text-4xl font-bold mb-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">Projects</span>
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "AI Chat Application", desc: "Next.js with OpenAI API integration", icon: "🤖" },
                { title: "3D Portfolio Website", desc: "Three.js and Framer Motion", icon: "🌐" },
                { title: "Machine Learning Model", desc: "TensorFlow.js implementation", icon: "🧠" },
                { title: "E-commerce Platform", desc: "Full-stack development", icon: "🛒" },
                { title: "AR Mobile Application", desc: "React Native with ARKit", icon: "📱" },
                { title: "Data Visualization", desc: "D3.js and custom animations", icon: "📊" },
              ].map((project, i) => (
                <TiltCard key={i} className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl h-full">
                  <motion.div 
                    className="h-full flex flex-col"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <div className="text-5xl mb-4" style={{ transform: "translateZ(20px)" }}>{project.icon}</div>
                    <h3 className="text-xl font-bold mb-2" style={{ transform: "translateZ(30px)" }}>{project.title}</h3>
                    <p className="text-gray-300 mb-4 flex-grow" style={{ transform: "translateZ(40px)" }}>{project.desc}</p>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-pink-500/30 to-indigo-500/30 border border-white/10 py-2 rounded-lg mt-auto"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      View Project
                    </motion.button>
                  </motion.div>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>

        {/* AI Chat Section */}
        <section 
          id="chat" 
          className="min-h-screen flex flex-col justify-center items-center px-6 py-20 relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="max-w-4xl w-full mx-auto">
            <motion.h2 
              className="text-4xl font-bold mb-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              Chat with <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">Farrel AI</span>
            </motion.h2>
            
            <TiltCard className="bg-white/10 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl p-6">
              <div className="flex-1 overflow-y-auto max-h-96 mb-6 space-y-4" style={{ transform: "translateZ(20px)" }}>
                {messages.length === 0 ? (
                  <div className="text-center py-10 text-gray-300">
                    <div className="text-5xl mb-4">🤖</div>
                    <p>Hello! I'm Farrel AI. How can I help you today?</p>
                  </div>
                ) : (
                  messages.map((m, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-2xl max-w-xs md:max-w-md ${m.role === "user" ? "bg-indigo-500 text-white ml-auto" : "bg-gray-700/50 text-white mr-auto"}`}
                      style={{ 
                        transformStyle: "preserve-3d",
                        marginLeft: m.role === "user" ? "auto" : "0",
                        marginRight: m.role === "bot" ? "auto" : "0",
                      }}
                    >
                      {m.text}
                    </motion.div>
                  ))
                )}
              </div>
              
              <form onSubmit={sendMessage} className="flex gap-3" style={{ transform: "translateZ(30px)" }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow px-5 py-3 bg-black/20 border border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Type a message..."
                />
                <motion.button 
                  type="submit" 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-full px-6 py-3 shadow-lg"
                >
                  Send
                </motion.button>
              </form>
            </TiltCard>
          </div>
        </section>

        {/* Contact Section */}
        <section 
          id="contact" 
          className="h-screen flex flex-col justify-center items-center px-6 relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.h2 
            className="text-4xl font-bold mb-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">Touch</span>
          </motion.h2>
          
          <TiltCard className="bg-white/10 p-10 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div style={{ transform: "translateZ(30px)" }}>
                <h3 className="text-2xl font-bold mb-6">Contact Info</h3>
                <div className="space-y-4">
                  <p className="flex items-center">
                    <span className="text-2xl mr-3">📧</span> 
                    <span>email@example.com</span>
                  </p>
                  <p className="flex items-center">
                    <span className="text-2xl mr-3">📞</span> 
                    <span>+62-XXX-XXXX-XXXX</span>
                  </p>
                  <p className="flex items-center">
                    <span className="text-2xl mr-3">📍</span> 
                    <span>Jakarta, Indonesia</span>
                  </p>
                </div>
                
                <div className="flex gap-4 mt-8">
                  {["📘", "📷", "🐦", "💼"].map((icon, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -5, scale: 1.1 }}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-indigo-500 flex items-center justify-center text-xl cursor-pointer shadow-lg"
                    >
                      {icon}
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div style={{ transform: "translateZ(40px)" }}>
                <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
                <form className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <input 
                    type="email" 
                    placeholder="Your Email" 
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <textarea 
                    placeholder="Your Message" 
                    rows="4"
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  ></textarea>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-pink-500 to-indigo-500 text-white py-3 rounded-lg font-medium shadow-lg"
                  >
                    Send Message
                  </motion.button>
                </form>
              </div>
            </div>
          </TiltCard>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 relative z-10">
        <p>© {new Date().getFullYear()} Farrel Portfolio. All rights reserved.</p>
      </footer>
    </div>
  );
}