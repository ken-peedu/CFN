// application requires the aws-sdk module
var AWS = require('aws-sdk');
// sets region to eu-west-1
AWS.config.update({region: 'eu-west-1'});

// constructs a service object.
var cloudformation = new AWS.CloudFormation();
//declare an array to which data will be pushed
var resultArray = [];
//calls the describeStacks operation without NextToken and no specified stack (all stacks)
cloudformation.describeStacks(function (err, data) {
    //measures the length of the Stacks array (number of stacks on account)
    var stackLength = data.Stacks.length;
    //Declares an array to which a single stack's information will be pushed
    var Stack = [];
    //iterates over every index in the data.stacks array (every stack)
    for (stackIndex = 0; stackIndex < stackLength; stackIndex++) {
        //save stack name into variable as object
        var StackName = {StackName: data.Stacks[stackIndex].StackName};         
        //save stack id into variable as object
        var StackId = {StackId: data.Stacks[stackIndex].StackId};
        //save stack status into variable as object
        var StackStatus = {StackStatus: data.Stacks[stackIndex].StackStatus};
        //save stack parameters into variable as object
        var Parameters = {Parameters: data.Stacks[stackIndex].Parameters};
        //save creation time into variable as object
        var CreationTime = {CreationTime: data.Stacks[stackIndex].CreationTime};  
        //Template description
        var Description = {Description: data.Stacks[stackIndex].Description};
        //ParentID indicating nestedness, if function checks if ParentID is null
        if (data.Stacks[stackIndex].ParentId != null) {
        //code block to execute if ParentID is not null
        var ParentID = {ParentID: data.Stacks[stackIndex].ParentId}
        } else {
        //code block to execute if ParentID is null
        var ParentID = {ParentID: "No ID available, because stack is not nested"}
        }
        //sets the Stack array with objects according to assignment, Stack array describes 1 stack
        var Stack = [StackName, StackId, StackStatus, Parameters, CreationTime, Description, ParentID]
        //Pushes the Stack array into resultArray
        resultArray.push(Stack); 
    };
    //repeats describeStacks function with NextToken parameter(from previous call) to finish query on all stacks
    newtoken = {NextToken: data.NextToken};
    cloudformation.describeStacks(newtoken, function (err, data) {
        var stackLength = data.Stacks.length;
        for (stackIndex = 0; stackIndex < stackLength; stackIndex++) {
            var StackName = {StackName: data.Stacks[stackIndex].StackName};
            var StackId = {StackId: data.Stacks[stackIndex].StackId};
            var StackStatus = {StackStatus: data.Stacks[stackIndex].StackStatus};
            var Parameters = {Parameters: data.Stacks[stackIndex].Parameters};
            var CreationTime = {CreationTime: data.Stacks[stackIndex].CreationTime};           
            var Description = {Description: data.Stacks[stackIndex].Description};
            if (data.Stacks[stackIndex].ParentId != null) {
            var ParentID = {ParentID: data.Stacks[stackIndex].ParentId}
            } else {
            var ParentID = {ParentID: "No ID available, because stack is not nested"}
            }
            var Stack = [StackName, StackId, StackStatus, Parameters, CreationTime, Description, ParentID]; 
            resultArray.push(Stack);               
        };
        //declare interval variable
        var interval;
        //set stack which to start counting from (beginning of Stack array)
        var stackIndex = 0;
        //function declaration
        function myListStackResources(){
            //if function loops through every stack
            if(stackIndex < resultArray.length) {
            //declare StackName parameter from previously created array
            var params = resultArray[stackIndex][0];
            //listStackResources API call with StackName parameter
            cloudformation.listStackResources(params, function (err, data) {
                //format data
                var StackResources = {StackResources: data.StackResourceSummaries};
                //push formated data to array
                resultArray[stackIndex].push(StackResources);
                //Proceed to next stack
                stackIndex++;
            });
            } else { 
                //when if function reaches final stack, clear interval so it doesnt start again
                clearInterval(interval);
                //format the final array to proper JSON format
                stringedArray = JSON.stringify(resultArray, null, 4);      
                //script output
                console.log(stringedArray)
            }
        };
        //set interval for myListStackResources function to 500 ms so script doesnt bug out
        //because API callback isnt properly waited for, and call the function
        interval = setInterval(myListStackResources, 500);
    });
});