"use client"

import { useState, useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PreviewModal } from "@/components/configurator/PreviewModal"
import { useTheme } from "@/contexts/ThemeContext"
import { 
  Play, 
  ExternalLink, 
  Lightbulb,
  Palette,
  Users,
  MessageSquare
} from "lucide-react"

export function LiveDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEmbedLoaded, setIsEmbedLoaded] = useState(false)
  const embedRef = useRef<HTMLDivElement>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const { resolvedTheme } = useTheme()

  // Default configuration for live demo modal - uses current theme
  const defaultConfig = {
    width: '100%',
    height: '100%',
    theme: resolvedTheme as 'light' | 'dark',
    borderRadius: '8px',
    backgroundColor: resolvedTheme === 'dark' ? '#0F172A' : '#FFFFFF'
  }

  const handleStartDemo = () => {
    console.log('Start Demo clicked!', { embedRef: embedRef.current, isEmbedLoaded })
    
    if (embedRef.current && !isEmbedLoaded) {
      // Load the embed script when user clicks start
      const script = document.createElement('script')
      script.src = '/embed.js'
      script.async = true
      script.setAttribute('data-container', 'curia-live-demo')
      script.setAttribute('data-theme', resolvedTheme) // Use current theme
      script.setAttribute('data-height', '500px')
      script.setAttribute('data-border-radius', '8px')
      script.setAttribute('data-background-color', resolvedTheme === 'dark' ? '#0F172A' : '#FFFFFF')
      
      document.head.appendChild(script)
      scriptRef.current = script
      setIsEmbedLoaded(true)
      
      console.log('Embed script loaded and state updated')
    } else {
      console.log('Embed already loaded or no container found')
    }
  }

  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current)
      }
      
      // Clean up global reference
      if (window.curiaEmbed) {
        if (window.curiaEmbed.destroy) {
          window.curiaEmbed.destroy()
        }
        delete window.curiaEmbed
      }
    }
  }, [])
  
  return (
    <section className="py-20 sm:py-32 no-horizontal-scroll">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-6 mb-20">
          <Badge className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800">
            <Play className="w-4 h-4" />
            Live Demo
          </Badge>
          
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            See it{" "}
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              in action
            </span>
          </h2>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Experience the complete Web3 forum functionality running live. 
            Connect your wallet, test authentication, and interact with the community features.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* Demo Preview */}
          <div className="space-y-6 lg:col-span-2">
            <div className="h-[500px] rounded-lg bg-slate-50 dark:bg-slate-900 overflow-hidden relative shadow-xl border border-slate-200 dark:border-slate-700">
              {/* Always present embed container */}
              <div 
                id="curia-live-demo"
                ref={embedRef}
                className="w-full h-full"
              />
              
              {/* Big Play Button Overlay (only shown when not loaded) */}
              {!isEmbedLoaded && (
                <button 
                  onClick={handleStartDemo}
                  className="absolute inset-0 w-full h-full flex flex-col items-center justify-center space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 border-2 border-dashed border-blue-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-slate-500 rounded-lg group"
                >
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <Play className="w-12 h-12 text-white ml-1" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      Start Demo
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 max-w-md px-4">
                      Experience the full Web3 forum functionality
                    </p>
                  </div>
                </button>
              )}
            </div>
          </div>
          
          {/* Demo Features */}
          <div className="space-y-8 lg:col-span-1">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                What you'll experience
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      Multi-Identity Authentication
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                      Connect with Universal Profile, ENS domain, or browse anonymously. 
                      See real blockchain profile data integration.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      Full Forum Experience
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                      Create posts, comment, react, and experience real-time updates. 
                      All running inside a simple iframe embed.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center shrink-0">
                    <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      Responsive Design
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                      Test how the embed adapts to different screen sizes and 
                      integrates seamlessly with your site's design.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Action */}
            <div className="mt-8">
              <Button 
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                onClick={() => window.location.href = '/get-started'}
              >
                🚀 Get Your Own Forum
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Modal */}
      <PreviewModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        config={defaultConfig}
      />
    </section>
  )
} 