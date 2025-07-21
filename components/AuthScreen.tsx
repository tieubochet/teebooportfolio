import React, { useState } from 'react';

// Hàm mã hóa chuỗi bằng thuật toán SHA-256
async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface AuthScreenProps {
  passwordHash: string | null;
  onAuthSuccess: () => void;
  onPasswordSet: (newHash: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ passwordHash, onAuthSuccess, onPasswordSet }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isSetupMode = passwordHash === null;
  const title = isSetupMode ? "Tạo mật khẩu truy cập" : "Nhập mật khẩu";
  const buttonText = isSetupMode ? "Tạo và Đăng nhập" : "Đăng nhập";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSetupMode) {
        if (!password) {
            setError('Mật khẩu không được để trống.');
            return;
        }
        if (password.length < 4) {
             setError('Mật khẩu phải có ít nhất 4 ký tự.');
             return;
        }
        if (password !== confirmPassword) {
          setError('Mật khẩu xác nhận không khớp.');
          return;
        }
        const newHash = await hashString(password);
        onPasswordSet(newHash);
      } else {
        const enteredHash = await hashString(password);
        if (enteredHash === passwordHash) {
          onAuthSuccess();
        } else {
          setError('Mật khẩu không đúng. Vui lòng thử lại.');
        }
      }
    } catch (err) {
        console.error("Authentication error:", err);
        setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm mx-auto bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-8">
        <h1 className="text-2xl font-bold text-center text-white mb-6">{title}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">
              {isSetupMode ? "Mật khẩu mới" : "Mật khẩu"}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              required
              autoFocus
            />
          </div>

          {isSetupMode && (
            <div>
              <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-gray-300">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                id="confirm-password"
                name="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              />
            </div>
          )}
          
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg transition disabled:bg-indigo-400 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : buttonText}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;
