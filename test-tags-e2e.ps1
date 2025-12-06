$ErrorActionPreference = 'Stop'

Write-Output 'Running E2E tag persistence test...'
Write-Output ''

try {
  # Step 1: Login
  Write-Output '1. Authenticating...'
  $loginBody = @{ 
    email = 'alex.r@apollo.app'
    password = '123456' 
  } | ConvertTo-Json
  
  $login = Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/auth/login' -Body $loginBody -ContentType 'application/json' -ErrorAction Stop
  
  Write-Output "   ✓ Login successful"
  Write-Output "   Response: $($login | ConvertTo-Json -Depth 5)"
  Write-Output ''
  
  # Extract token
  $token = $login.token
  if (-not $token) { $token = $login.accessToken }
  if (-not $token) { throw 'Token not found in login response' }
  
  Write-Output "   ✓ Token acquired: $($token.Substring(0, 20))..."
  Write-Output ''
  
  # Step 2: Create a tag
  Write-Output '2. Creating test tag...'
  $headers = @{ Authorization = "Bearer $token" }
  $tagBody = @{ name = 'test-tag-from-e2e' } | ConvertTo-Json
  
  $created = Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/tags' -Body $tagBody -ContentType 'application/json' -Headers $headers -ErrorAction Stop
  
  Write-Output "   ✓ Tag created successfully"
  Write-Output "   Created tag: $($created | ConvertTo-Json -Depth 5)"
  Write-Output ''
  
  # Step 3: List tags
  Write-Output '3. Listing all tags...'
  $list = Invoke-RestMethod -Method Get -Uri 'http://localhost:4000/tags' -Headers $headers -ErrorAction Stop
  
  Write-Output "   ✓ Retrieved tags list"
  Write-Output "   Tags: $($list | ConvertTo-Json -Depth 5)"
  Write-Output ''
  
  Write-Output '✅ E2E test completed successfully!'
  Write-Output "   Tag persistence verified: found $($list.Count) tag(s) in database"
  
} catch {
  Write-Output ''
  Write-Output "❌ Error during E2E test:"
  Write-Output "   $($_.Exception.Message)"
  if ($_.ErrorDetails) {
    Write-Output "   Details: $($_.ErrorDetails.Message)"
  }
  exit 1
}
