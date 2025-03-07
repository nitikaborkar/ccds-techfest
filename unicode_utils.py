import sys
import os

def setup_unicode_support():
    """Configure environment for proper Unicode handling in Windows command prompt"""
    # Try to enable proper Unicode handling in Windows command prompt
    if sys.platform == 'win32':
        try:
            import ctypes
            kernel32 = ctypes.windll.kernel32
            kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)
            os.system('')  # This triggers the ANSI code handling in Windows
        except:
            pass  # Silently fail if this doesn't work

    # Determine if we should use Unicode or ASCII symbols
    use_unicode = sys.stdout.encoding.lower() in ('utf-8', 'utf8')
    
    # Define fallback symbols
    symbols = {
        'success': "✅" if use_unicode else "[SUCCESS]",
        'error': "❌" if use_unicode else "[ERROR]",
        'warning': "⚠️" if use_unicode else "[WARNING]",
        'loading': "🔄" if use_unicode else "[LOADING]",
        'pdf': "📄" if use_unicode else "[PDF]",
        'announce': "📢" if use_unicode else "[INPUT]",
        'search': "🔍" if use_unicode else "[SEARCH]",
        'check': "✓" if use_unicode else "[CHECK]",
        'page': "📃" if use_unicode else "[PAGE]",
        'clock': "⏱️" if use_unicode else "[TIME]",
        'link': "🔗" if use_unicode else "[LINK]",
        'save': "💾" if use_unicode else "[SAVE]",
        'data': "📊" if use_unicode else "[DATA]"
    }
    
    return symbols

# Export the symbols globally
SYMBOLS = setup_unicode_support()

# Safe print function that handles Unicode errors
def safe_print(text):
    """Print text safely, replacing any characters that can't be encoded"""
    try:
        print(text)
    except UnicodeEncodeError:
        # Replace any problematic characters with '?' and print
        encoding = sys.stdout.encoding
        print(text.encode(encoding, errors='replace').decode(encoding))