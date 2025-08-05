#!/usr/bin/env pwsh

# Скрипт для сборки и деплоя проекта
# Выполняет: npm run build -> git add . -> git commit -> git push

Write-Host "=== Начало процесса сборки и деплоя ===" -ForegroundColor Green

# Функция для проверки успешности выполнения команды
function Test-CommandSuccess {
    param($ExitCode, $CommandName)
    if ($ExitCode -ne 0) {
        Write-Host "❌ Ошибка при выполнении: $CommandName" -ForegroundColor Red
        Write-Host "Код выхода: $ExitCode" -ForegroundColor Red
        exit $ExitCode
    } else {
        Write-Host "✅ $CommandName выполнено успешно" -ForegroundColor Green
    }
}

try {
    # 1. Сборка проекта
    Write-Host "`n🔨 Выполняется сборка проекта..." -ForegroundColor Yellow
    npm run build
    Test-CommandSuccess $LASTEXITCODE "npm run build"

    # 2. Добавление всех изменений в git
    Write-Host "`n📦 Добавление файлов в git..." -ForegroundColor Yellow
    git add .
    Test-CommandSuccess $LASTEXITCODE "git add ."

    # 3. Проверка наличия изменений для коммита
    $gitStatus = git status --porcelain
    if ([string]::IsNullOrEmpty($gitStatus)) {
        Write-Host "ℹ️ Нет изменений для коммита" -ForegroundColor Cyan
        exit 0
    }

    # 4. Коммит изменений
    Write-Host "`n💾 Создание коммита..." -ForegroundColor Yellow
    git commit -m "update"
    Test-CommandSuccess $LASTEXITCODE "git commit"

    # 5. Отправка в удаленный репозиторий
    Write-Host "`n🚀 Отправка в удаленный репозиторий..." -ForegroundColor Yellow
    git push
    Test-CommandSuccess $LASTEXITCODE "git push"

    Write-Host "`n🎉 Все операции выполнены успешно!" -ForegroundColor Green

} catch {
    Write-Host "`n❌ Произошла неожиданная ошибка:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor DarkRed
    exit 1
}

Write-Host "`n=== Процесс завершен ===" -ForegroundColor Green