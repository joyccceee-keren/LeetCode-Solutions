class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        n = len(nums)
        dict1 = {}
        for i in range(n):
            if nums[i] in dict1:
                return True
            dict1[nums[i]]= i
        return False        
                
                
       