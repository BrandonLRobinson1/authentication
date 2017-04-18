// var results = [1,2,3];
var arr1 = [1,2,3] 
var arr2 = [4,5,6,7,8,9,10,11]

var findMedianSortedArrays = function(nums1, nums2) {
    var results = [].concat(nums1, nums2).slice().sort( (a,b)=> a-b );
    //var median;
    
    // if ( results.length % 2 === 0 ) {
    //     console.log('issa even');
    //     let index1 = results[ Math.floor( (results.length-1) / 2 ) ];
    //     let index2 = results[ Math.ceil( (results.length-1) / 2 ) ];
    //     median = (index1 + index2) / 2;
        
    // } else {
    //     console.log('issa false');
    //     median = results[ (results.length-1) / 2 ];
    // }
    // return median;
    
    
    //shorter more accepted answer
    if ( results.length % 2 === 0 ) {
        console.log( (results[Math.floor(results.length/2)-1] + results[Math.floor(results.length/2)]) / 2)
        return (results[Math.floor(results.length/2)-1] + results[Math.floor(results.length/2)]) / 2
        
    } else {
        console.log(results[ (results.length-1) / 2 ])
        return results[ (results.length-1) / 2 ];
    }
};

findMedianSortedArrays(arr1, arr2);