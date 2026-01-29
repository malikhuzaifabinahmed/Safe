use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use sha2::{Sha256, Digest};
use std::fs;
use std::path::Path;
use walkdir::WalkDir;

// Marker bytes at the start of encrypted files
const ENCRYPTION_MARKER: &[u8] = b"SAFE_ENCRYPTED_V1";

// Derive a 256-bit key from password using SHA-256
fn derive_key(password: &str) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(password.as_bytes());
    let result = hasher.finalize();
    let mut key = [0u8; 32];
    key.copy_from_slice(&result);
    key
}

// Check if a file is encrypted
fn is_file_encrypted(file_path: &Path) -> bool {
    if let Ok(content) = fs::read(file_path) {
        content.starts_with(ENCRYPTION_MARKER)
    } else {
        false
    }
}

// Encrypt a file
fn encrypt_file(file_path: &Path, password: &str) -> Result<(), String> {
    // Check if already encrypted
    if is_file_encrypted(file_path) {
        return Err("File is already encrypted".to_string());
    }

    // Read file content
    let content = fs::read(file_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    // Derive key from password
    let key = derive_key(password);
    let cipher = Aes256Gcm::new_from_slice(&key)
        .map_err(|e| format!("Failed to create cipher: {}", e))?;
    
    // Use a fixed nonce for simplicity (in production, use random nonce and store it)
    let nonce = Nonce::from_slice(b"unique nonce"); // 12 bytes
    
    // Encrypt
    let ciphertext = cipher.encrypt(nonce, content.as_ref())
        .map_err(|e| format!("Encryption failed: {}", e))?;
    
    // Prepend encryption marker
    let mut final_content = ENCRYPTION_MARKER.to_vec();
    final_content.extend_from_slice(&ciphertext);
    
    // Write encrypted content back
    fs::write(file_path, final_content)
        .map_err(|e| format!("Failed to write encrypted file: {}", e))?;
    
    Ok(())
}

// Decrypt a file
fn decrypt_file(file_path: &Path, password: &str) -> Result<(), String> {
    // Read encrypted content
    let content = fs::read(file_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    // Check if file is encrypted
    if !content.starts_with(ENCRYPTION_MARKER) {
        return Err("File is not encrypted".to_string());
    }
    
    // Remove encryption marker
    let ciphertext = &content[ENCRYPTION_MARKER.len()..];
    
    // Derive key from password
    let key = derive_key(password);
    let cipher = Aes256Gcm::new_from_slice(&key)
        .map_err(|e| format!("Failed to create cipher: {}", e))?;
    
    // Use the same nonce
    let nonce = Nonce::from_slice(b"unique nonce");
    
    // Decrypt
    let plaintext = cipher.decrypt(nonce, ciphertext)
        .map_err(|e| format!("Decryption failed (wrong password?): {}", e))?;
    
    // Write decrypted content back
    fs::write(file_path, plaintext)
        .map_err(|e| format!("Failed to write decrypted file: {}", e))?;
    
    Ok(())
}

#[tauri::command]
fn encrypt_directory(path: String, password: String) -> Result<String, String> {
    let dir_path = Path::new(&path);
    
    if !dir_path.exists() {
        return Err("Directory does not exist".to_string());
    }
    
    let mut encrypted_count = 0;
    let mut skipped_count = 0;
    let mut errors = Vec::new();
    
    // Walk through all files in directory
    for entry in WalkDir::new(dir_path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
    {
        let file_path = entry.path();
        
        // Skip files that are already encrypted
        if is_file_encrypted(file_path) {
            skipped_count += 1;
            println!("Skipped (already encrypted): {:?}", file_path);
            continue;
        }
        
        match encrypt_file(file_path, &password) {
            Ok(_) => {
                encrypted_count += 1;
                println!("Encrypted: {:?}", file_path);
            }
            Err(e) => {
                errors.push(format!("{:?}: {}", file_path, e));
            }
        }
    }
    
    if errors.is_empty() {
        Ok(format!("Successfully encrypted {} files ({} already encrypted)", encrypted_count, skipped_count))
    } else {
        Err(format!("Encrypted {} files with {} errors: {}", 
            encrypted_count, errors.len(), errors.join(", ")))
    }
}

#[tauri::command]
fn decrypt_directory(path: String, password: String) -> Result<String, String> {
    let dir_path = Path::new(&path);
    
    if !dir_path.exists() {
        return Err("Directory does not exist".to_string());
    }
    
    let mut decrypted_count = 0;
    let mut skipped_count = 0;
    let mut errors = Vec::new();
    
    // Walk through all files in directory
    for entry in WalkDir::new(dir_path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
    {
        let file_path = entry.path();
        
        // Skip files that are not encrypted
        if !is_file_encrypted(file_path) {
            skipped_count += 1;
            println!("Skipped (not encrypted): {:?}", file_path);
            continue;
        }
        
        match decrypt_file(file_path, &password) {
            Ok(_) => {
                decrypted_count += 1;
                println!("Decrypted: {:?}", file_path);
            }
            Err(e) => {
                errors.push(format!("{:?}: {}", file_path, e));
            }
        }
    }
    
    if errors.is_empty() {
        Ok(format!("Successfully decrypted {} files ({} already decrypted)", decrypted_count, skipped_count))
    } else {
        Err(format!("Decrypted {} files with {} errors: {}", 
            decrypted_count, errors.len(), errors.join(", ")))
    }
}

// Check if directory is encrypted
#[tauri::command]
fn check_safe_status(path: String) -> Result<bool, String> {
    let dir_path = Path::new(&path);
    
    if !dir_path.exists() {
        return Err("Directory does not exist".to_string());
    }
    
    // Check first few files to determine encryption status
    let mut encrypted_count = 0;
    let mut total_count = 0;
    
    for entry in WalkDir::new(dir_path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
        .take(10) // Check first 10 files for speed
    {
        total_count += 1;
        if is_file_encrypted(entry.path()) {
            encrypted_count += 1;
        }
    }
    
    // If no files found, consider it unlocked
    if total_count == 0 {
        return Ok(false);
    }
    
    // Consider encrypted if most files are encrypted
    Ok(encrypted_count > total_count / 2)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![encrypt_directory, decrypt_directory, check_safe_status])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
