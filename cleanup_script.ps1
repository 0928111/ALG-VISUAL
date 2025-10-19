# PowerShell清理脚本
Write-Host "开始清理配置文件..." -ForegroundColor Green

# 创建trash_can文件夹
$trashPath = "d:\1-毕业论文\ALG-VISUAL\trash_can"
if (!(Test-Path $trashPath)) {
    New-Item -ItemType Directory -Path $trashPath -Force
    Write-Host "已创建trash_can文件夹" -ForegroundColor Yellow
}

# 移动测试HTML文件
Move-Item -Path "d:\1-毕业论文\ALG-VISUAL\test-threejs-integration.html" -Destination $trashPath -Force -ErrorAction SilentlyContinue
Move-Item -Path "d:\1-毕业论文\ALG-VISUAL\test-webgl-integration.html" -Destination $trashPath -Force -ErrorAction SilentlyContinue
Move-Item -Path "d:\1-毕业论文\ALG-VISUAL\webgl-demo.html" -Destination $trashPath -Force -ErrorAction SilentlyContinue
Move-Item -Path "d:\1-毕业论文\ALG-VISUAL\webgl-performance-benchmark.html" -Destination $trashPath -Force -ErrorAction SilentlyContinue

# 移动TypeScript编译缓存文件
Move-Item -Path "d:\1-毕业论文\ALG-VISUAL\tsconfig.tsbuildinfo" -Destination $trashPath -Force -ErrorAction SilentlyContinue
Move-Item -Path "d:\1-毕业论文\ALG-VISUAL\tsconfig.node.tsbuildinfo" -Destination $trashPath -Force -ErrorAction SilentlyContinue

# 移动Vite编译输出文件
Move-Item -Path "d:\1-毕业论文\ALG-VISUAL\vite.config.d.ts" -Destination $trashPath -Force -ErrorAction SilentlyContinue

# 移动packages目录下的备份文件
Move-Item -Path "d:\1-毕业论文\ALG-VISUAL\packages\flowchart-renderer\DirectedWeightedGraphRenderer.ts.backup" -Destination $trashPath -Force -ErrorAction SilentlyContinue
Move-Item -Path "d:\1-毕业论文\ALG-VISUAL\packages\flowchart-renderer\GraphRenderer.ts.backup2" -Destination $trashPath -Force -ErrorAction SilentlyContinue

Write-Host "清理完成！" -ForegroundColor Green
Write-Host "文件已移动到: $trashPath" -ForegroundColor Yellow

# 显示移动的文件
Write-Host "trash_can文件夹内容:" -ForegroundColor Cyan
Get-ChildItem $trashPath | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor Gray
}