export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-4 mt-auto">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2">
        
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} TaskForge. All rights reserved.
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <a href="#" className="hover:text-purple-600 transition">Privacy</a>
          <a href="#" className="hover:text-purple-600 transition">Terms</a>
          <a href="#" className="hover:text-purple-600 transition">Support</a>
        </div>

      </div>
    </footer>
  );
}