# 综合清理脚本 - 移除所有不适用于标签碰撞优化的旧渲染器文件
$trashPath = "d:\1-毕业论文\ALG-VISUAL\trash_can"

Write-Host "开始清理不适用于标签碰撞优化的旧渲染器文件..." -ForegroundColor Yellow

# 创建trash_can文件夹（如果不存在）
if (!(Test-Path $trashPath)) {
    New-Item -ItemType Directory -Path $trashPath -Force
}

# 定义要清理的旧渲染器文件列表
$filesToClean = @(
    # 旧的动画控制器和渲染器
    "packages\flowchart-renderer\AnimationController.ts",
    "packages\flowchart-renderer\DirectedWeightedGraphRenderer.ts", 
    "packages\flowchart-renderer\DynamicGraphRenderer.ts",
    "packages\flowchart-renderer\EnhancedAnimationController.ts",
    "packages\flowchart-renderer\SimulationAnimationScheduler.ts",
    "packages\flowchart-renderer\PositionBoundaryConstraintManager.ts", 
    "packages\flowchart-renderer\FailureProtectionRollbackManager.ts",
    "packages\flowchart-renderer\GraphRenderer.ts",
    
    # WebGL相关文件（已清理过，再次确认）
    "packages\flowchart-renderer\ThreeGraphRenderer.ts",
    "packages\flowchart-renderer\ThreeForceSimulation.ts", 
    "packages\flowchart-renderer\ThreePerformanceRenderer.ts",
    "packages\flowchart-renderer\WEBGL_README.md",
    
    # 调试脚本
    "packages\flowchart-renderer\debug-scripts\fix-container-select.ps1",
    "packages\flowchart-renderer\debug-scripts\fix-container-select-v2.ps1", 
    "packages\flowchart-renderer\debug-scripts\fix-container-select-smart.ps1",
    "packages\flowchart-renderer\debug-scripts\fix-encoding-issues.ps1",
    
    # 测试文件和HTML
    "packages\flowchart-renderer\webgl-integration-test.html",
    "packages\flowchart-renderer\webgl-test.html",
    
    # 旧的备份文件
    "packages\flowchart-renderer\DirectedWeightedGraphRenderer.ts.backup",
    "packages\flowchart-renderer\GraphRenderer.ts.backup2"
)

# 移动文件到trash_can
$cleanedCount = 0
foreach ($file in $filesToClean) {
    $fullPath = "d:\1-毕业论文\ALG-VISUAL\$file"
    if (Test-Path $fullPath) {
        try {
            Move-Item -Path $fullPath -Destination $trashPath -Force
            Write-Host "已清理: $file" -ForegroundColor Green
            $cleanedCount++
        }
        catch {
            Write-Host "清理失败: $file - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    else {
        Write-Host "文件不存在: $file" -ForegroundColor Gray
    }
}

Write-Host "`n清理完成！总计清理了 $cleanedCount 个文件" -ForegroundColor Yellow
Write-Host "所有文件已移动到: $trashPath" -ForegroundColor Cyan

# 显示trash_can中的文件列表
Write-Host "`n当前trash_can中的文件:" -ForegroundColor Magenta
Get-ChildItem $trashPath | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor White
}