# GitHub Upload Instructions

Your project is now ready to be uploaded to GitHub! Follow these steps:

## Step 1: Create a GitHub Repository
1. Go to [GitHub.com](https://github.com/new)
2. Create a new repository (name: `frontend_18_rinkal_microsoft_hackathon` or similar)
3. Do NOT initialize with README, .gitignore, or license
4. Click "Create repository"

## Step 2: Connect Local Repository to GitHub
Copy and run these commands in PowerShell:

```powershell
cd "C:\Users\Shaurya Salke\OneDrive\Desktop\VS\hackathons\frontend_18_rinkal_microsoft_hackathon"

# Replace USERNAME/REPO with your GitHub username and repository name
git remote add origin https://github.com/USERNAME/REPO.git
git branch -M main
git push -u origin main
```

## Step 3: Verify Upload
Visit `https://github.com/USERNAME/REPO` to see your uploaded project with:
- ✅ All source files
- ✅ Video file (data/secret.mp4 - 1.39 MB)
- ✅ Secret module (js/secret.js)
- ✅ Git configuration files (.gitignore, .gitattributes)

## File Size Summary
- Total project size: ~15 MB (well within GitHub limits)
- Video file: 1.39 MB (no Git LFS needed)
- All files are tracked by git and will be pushed

## Security Note
The "wifi" easter egg keyword is obfuscated using JavaScript character codes, making it less obvious when browsing the code.

## Pulling the Code Later
```powershell
git clone https://github.com/USERNAME/REPO.git
cd REPO
```

That's it! Your project with the secret video feature is now on GitHub! 🚀
