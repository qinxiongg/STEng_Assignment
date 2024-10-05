// cURL for create task
$body = @{
    username = "PL"
    password = "abc123!!"
    appAcronym = "App1"
    taskName = "test1"
    taskDescription = ""
    taskNotes = ""
    taskPlan = "plan"
}

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/demo/CreateTask" `
-Method Post `
-ContentType "application/json" `
-Body ($body | ConvertTo-Json)

# Output the full response
$response


// cURL for get task by state
$body = @{
    username   = "PL"
    password   = "abc123!!"
    appAcronym = "App1"
    taskState  = "Closed"
}

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/demo/getTaskByState" `
-Method Post `
-ContentType "application/json" `
-Body ($body | ConvertTo-Json)

# Output the full response
$response


// cURL for promote task 2 done
$body = @{
    "username"   = "dev1"
    "password"   = "abc123!!"
    "appAcronym" = "App1"
    "taskId" = "App1_13",
    "taskNotes" = ""
}

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/demo/promoteTask2Done" `
-Method Post `
-ContentType "application/json" `
-Body ($body | ConvertTo-Json)

# Output the full response
$response
