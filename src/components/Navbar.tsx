import { useRef, useState } from 'react';
import { auth, loginWithGoogle } from '../lib/firebase';
import { LogOut, User as UserIcon, Camera, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface NavbarProps {
  user: any;
  userData: any;
  onUpdateProfile: (updates: any) => Promise<void>;
}

export function Navbar({ user, userData, onUpdateProfile }: NavbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 2MB for browser performance, but we will resize it
    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen es demasiado grande. Por favor elige una menor a 2MB.");
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const img = new Image();
        img.onload = async () => {
          // Resize to a reasonable size for Firestore profile pic
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 200;
          const MAX_HEIGHT = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          await onUpdateProfile({ photoURL: dataUrl });
          setIsUploading(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Hubo un error al subir la imagen.");
      setIsUploading(false);
    }
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b-2 border-matcha-brown shadow-[0px_4px_0px_0px_rgba(52,59,27,0.1)]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-matcha-green rounded-full flex items-center justify-center border-2 border-matcha-brown font-display font-bold text-matcha-brown text-lg shadow-[2px_2px_0px_0px_rgba(52,59,27,1)]">
          sm
        </div>
        <h1 className="text-2xl tracking-tight">Matcha Tasks</h1>
      </div>
      
      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-matcha-vanilla/40 border-2 border-matcha-brown rounded-full font-medium text-sm group relative">
              <div 
                className="relative cursor-pointer"
                onClick={handleImageClick}
                title="Cambiar foto de perfil"
              >
                {userData?.photoURL ? (
                  <img 
                    src={userData.photoURL} 
                    alt={userData.displayName} 
                    className="w-8 h-8 rounded-full border border-matcha-brown object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-matcha-green/20 flex items-center justify-center border border-matcha-brown">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
              
              <span className="max-w-[120px] truncate">{userData?.displayName || user.displayName}</span>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <button 
              onClick={() => auth.signOut()}
              className="matcha-button bg-white hover:bg-red-50 text-red-600 border-red-600 shadow-[2px_2px_0px_0px_rgba(220,38,38,1)]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </button>
          </div>
        ) : (
          <button 
            onClick={loginWithGoogle}
            className="matcha-button bg-matcha-blue text-white"
          >
            Iniciar Sesión
          </button>
        )}
      </div>
    </nav>
  );
}
