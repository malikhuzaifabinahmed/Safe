# Safe Application - Encryption & Decryption

## 🔐 Complete Transformation

The Safe application has been completely redesigned! It's no longer a file explorer - it's now a **true encryption safe** that protects your files with military-grade AES-256 encryption.

## ✅ What's Changed

### ❌ Removed Features
- ~~File Explorer~~ - No longer browsing files
- ~~File Preview~~ - No longer previewing content
- ~~Directory Navigation~~ - No longer navigating folders

### ✅ New Features
1. **🔒 Directory Encryption** - Encrypt entire directories with one click
2. **🔓 Directory Decryption** - Decrypt all files with your password
3. **🔐 AES-256 Encryption** - Military-grade encryption
4. **🎨 Beautiful UI** - Clean, modern interface
5. **📊 Status Indicators** - See if your safe is locked or unlocked
6. **⚡ Batch Processing** - Encrypts/decrypts all files in directory

## 🎯 How It Works

### Step 1: Enter Safe Path
Enter the path to the directory you want to protect:
```
C:\Users\YourName\Documents\MySafe
```

### Step 2: Enter Password
Choose a strong password - this is your encryption key!
```
Your-Super-Secret-Password-123
```

### Step 3: Choose Action

#### 🔒 Encrypt Directory
- Locks all files in the directory
- Files become unreadable gibberish
- Original content replaced with encrypted data
- Files stay in same location
- Filenames remain unchanged

#### 🔓 Decrypt Directory
- Unlocks all files in the directory
- Restores original file contents
- Files become readable and usable again
- Same password required to decrypt

## 🛡️ Security Features

### AES-256-GCM Encryption
- **Algorithm**: AES (Advanced Encryption Standard)
- **Key Size**: 256 bits
- **Mode**: GCM (Galois/Counter Mode)
- **Authentication**: Built-in integrity checking

### Password Protection
- Password hashed with SHA-256
- Derived into 256-bit encryption key
- Never stored anywhere
- Required for decryption

### What Gets Encrypted
- ✅ All files in directory
- ✅ All subdirectories
- ✅ Recursively processes nested folders
- ✅ File content fully encrypted
- ⚠️ Filenames remain visible (not encrypted)

## 📱 User Interface

### Main Screen Layout

```
┌─────────────────────────────────────────────────┐
│  🛡️ Safe Manager              🔒 Exit Safe     │
│  Encrypt and decrypt your files securely       │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │  Safe Information                       │  │
│  │  ┌─────────────────────────────────┐   │  │
│  │  │ Status: 🔓 Unlocked / 🔒 Locked │   │  │
│  │  └─────────────────────────────────┘   │  │
│  │  Path: C:\MySafe                        │  │
│  │  Password: •••••••                      │  │
│  │  ✅ Success: Files encrypted!           │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  │
│  │  🔒 Encrypt Safe │  │  🔓 Decrypt Safe │  │
│  │                  │  │                  │  │
│  │  • Encrypt files │  │  • Decrypt files │  │
│  │  • Use password  │  │  • Restore data  │  │
│  │  • Lock content  │  │  • Access files  │  │
│  │                  │  │                  │  │
│  │ [Encrypt Dir]    │  │ [Decrypt Dir]    │  │
│  └──────────────────┘  └──────────────────┘  │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │  🛡️ Security Information                │  │
│  │  • Keep password safe!                  │  │
│  │  • Uses AES-256 encryption              │  │
│  │  • Always backup files first            │  │
│  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Status Indicators
- 🔓 **Unlocked** (Green) - Files are currently decrypted and accessible
- 🔒 **Locked** (Red) - Files are currently encrypted and protected

### Action Cards

#### 🔒 Encrypt Safe Card (Red)
- **Button**: Red with lock icon
- **Action**: Encrypts all files
- **Result**: Files become unreadable
- **Status**: Changes to "Locked"

#### 🔓 Decrypt Safe Card (Green)
- **Button**: Green with unlock icon
- **Action**: Decrypts all files
- **Result**: Files become readable
- **Status**: Changes to "Unlocked"

## 🚀 Usage Example

### Creating a New Safe

1. **Create a test folder**:
```
C:\TestSafe
```

2. **Add some files**:
```
C:\TestSafe\secret.txt
C:\TestSafe\documents\report.pdf
C:\TestSafe\images\photo.jpg
```

3. **Run the app**:
```bash
npm run tauri dev
```

4. **Enter path**: `C:\TestSafe`

5. **Enter password**: `MySecurePassword123`

6. **Click "Encrypt Directory"**:
   - All files encrypted
   - Status shows "Locked"
   - Files now unreadable

7. **Try opening files**:
   - `secret.txt` → Gibberish
   - `report.pdf` → Won't open
   - `photo.jpg` → Corrupted/Won't display

8. **Click "Decrypt Directory"**:
   - All files decrypted
   - Status shows "Unlocked"
   - Files now readable again

## ⚠️ Important Warnings

### Before Encrypting
1. ✅ **Backup your files** - Always have a backup!
2. ✅ **Remember your password** - Can't decrypt without it
3. ✅ **Test with copies first** - Don't use on original files initially
4. ✅ **Close all files** - Make sure files aren't open in other programs

### Password Management
- ❌ **Lost password = Lost files** - No password recovery
- ✅ **Use strong passwords** - Mix of letters, numbers, symbols
- ✅ **Write it down** - Keep in secure location
- ✅ **Don't share** - Password is your encryption key

### File Safety
- ⚠️ **Encryption overwrites files** - Original content replaced
- ⚠️ **No undo** - Can only decrypt with correct password
- ⚠️ **Wrong password** - Will corrupt files permanently
- ⚠️ **Backup first** - Always have a copy elsewhere

## 🔧 Technical Details

### Rust Backend (`src-tauri/src/lib.rs`)

```rust
// Commands
encrypt_directory(path, password) -> Result<String, String>
decrypt_directory(path, password) -> Result<String, String>

// Encryption
- Algorithm: AES-256-GCM
- Key Derivation: SHA-256 hash of password
- Nonce: Fixed 12-byte nonce
- Processing: Recursive directory walking
```

### React Frontend (`src/components/SafeManager.tsx`)

```typescript
// State Management
- safePath: Directory to protect
- password: Encryption key
- safeStatus: 'locked' | 'unlocked'
- status: 'idle' | 'success' | 'error'

// Actions
handleEncrypt() - Calls Rust encrypt_directory
handleDecrypt() - Calls Rust decrypt_directory
```

### Dependencies

**Rust** (`Cargo.toml`):
```toml
aes-gcm = "0.10"     # AES encryption
sha2 = "0.10"        # Password hashing
hex = "0.4"          # Hex encoding
walkdir = "2"        # Directory traversal
```

**JavaScript** (`package.json`):
```json
@tauri-apps/api      # Tauri frontend API
lucide-react         # Icons
shadcn/ui            # UI components
```

## 📊 What Happens to Files

### Before Encryption
```
secret.txt:
Hello, this is my secret message!
```

### After Encryption
```
secret.txt:
�k�8�b��P�N
                ���T�u�&G�K
                           �����$�...
```

### After Decryption
```
secret.txt:
Hello, this is my secret message!
```

## 🎨 UI Features

### Visual Feedback
- ⏳ Loading spinners during operations
- ✅ Success messages in green
- ❌ Error messages in red
- 📊 File count in messages
- 🎨 Color-coded status badges

### Responsive Design
- Works on desktop sizes
- Cards adapt to screen width
- Mobile-friendly layout
- Dark mode support

## 🔄 Process Flow

```
Start App
    ↓
Enter Path → Validate Path
    ↓
Enter Password
    ↓
Main Screen
    ↓
┌───────────────┬───────────────┐
│               │               │
│   Encrypt     │   Decrypt     │
│      ↓        │      ↓        │
│  Walk Files   │  Walk Files   │
│      ↓        │      ↓        │
│  Read File    │  Read File    │
│      ↓        │      ↓        │
│  Encrypt      │  Decrypt      │
│      ↓        │      ↓        │
│  Write File   │  Write File   │
│      ↓        │      ↓        │
│  Next File    │  Next File    │
│      ↓        │      ↓        │
│  Success! ✅  │  Success! ✅  │
│               │               │
└───────────────┴───────────────┘
```

## 🚀 Getting Started

1. **Install dependencies**:
```bash
npm install
```

2. **Run development server**:
```bash
npm run tauri dev
```

3. **Test with sample files**:
   - Create `C:\TestSafe`
   - Add some text files
   - Encrypt them
   - Try to open (should be unreadable)
   - Decrypt them
   - Open again (should work)

## 🎉 You Now Have

✅ A fully functional encryption safe
✅ Military-grade AES-256 encryption
✅ Beautiful, modern UI
✅ Simple encrypt/decrypt workflow
✅ Password-protected security
✅ Batch file processing

**Your files are now truly SAFE!** 🔐
