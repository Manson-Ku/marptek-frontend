# generate-english-pages.ps1

$pages = @(
  "section_reviews/reviews",
  "section_reviews/autoResponse",
  "section_reviews/reviewInvite",
  "section_reviews/reviewNotifier",
  "section_performance/performance",
  "section_performance/keyword",
  "section_posts/postList",
  "section_posts/postBatch",
  "section_posts/postGenerator",
  "section_locations/locationHealthCheck",
  "section_locations/basicInfoManagement",
  "section_locations/propertyManagement",
  "section_locations/linkManagement",
  "section_locations/imageManagement",
  "section_competitors/competitorsLocal",
  "section_competitors/competitorsRegion",
  "section_ranking/localRank",
  "section_ranking/localSeo",
  "settings"
)

foreach ($page in $pages) {
  $dirPath = "app/$page"
  $filePath = "$dirPath/page.jsx"

  if (-not (Test-Path $dirPath)) {
    New-Item -Path $dirPath -ItemType Directory | Out-Null
    Write-Host "Create folder: $dirPath"
  }

  # Always overwrite with English content
  $content = @"
"use client";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

export default function Page() {
  return (
    <AuthenticatedLayout>
      <h1 className="text-xl font-bold mb-4"> Page Under Construction</h1>
      <p className="text-gray-600 text-sm">This is the page for $page</p>
    </AuthenticatedLayout>
  );
}
"@
  $content | Out-File -FilePath $filePath -Encoding utf8
  Write-Host "Updated: $filePath"
}

Write-Host "`n All pages updated to English version!"
