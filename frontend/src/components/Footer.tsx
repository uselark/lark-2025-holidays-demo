export function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-600">
          Explore{" "}
          <a
            href="https://docs.uselark.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-900 hover:text-gray-700 font-medium underline transition-colors"
          >
            Lark billing docs
          </a>{" "}
          or{" "}
          <a
            href="https://calendly.com/founders-uselark/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-900 hover:text-gray-700 font-medium underline transition-colors"
          >
            schedule time with a founder
          </a>
        </p>
      </div>
    </footer>
  );
}
