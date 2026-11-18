# ============================================================
# تحديث الموقع بضغطة واحدة
# دبل كليك على الملف ده بعد أي تعديل -> الموقع يتحدث تلقائياً
# ============================================================
Set-Location $PSScriptRoot

Write-Host "جارٍ حفظ التعديلات..." -ForegroundColor Cyan
git add -A
if ($LASTEXITCODE -ne 0) { Read-Host "حصل خطأ في git add. اضغط Enter للخروج"; exit 1 }

$msg = Read-Host "اكتب وصف مختصر للتعديل (أو اضغط Enter)"
if ([string]::IsNullOrWhiteSpace($msg)) { $msg = "Update " + (Get-Date -Format "yyyy-MM-dd HH:mm") }

git commit -m $msg
if ($LASTEXITCODE -ne 0) { Read-Host "مفيش تعديلات جديدة أو حصل خطأ. اضغط Enter"; exit 1 }

Write-Host "جارٍ الرفع..." -ForegroundColor Cyan
git push
if ($LASTEXITCODE -ne 0) { Read-Host "فشل الرفع — تأكد من إعداد الـ remote. اضغط Enter"; exit 1 }

Write-Host "تم ✅ الموقع هيتحدث خلال حوالي 30 ثانية على Vercel." -ForegroundColor Green
Start-Sleep -Seconds 2
