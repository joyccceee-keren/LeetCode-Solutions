class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        dict1 = {}

        for i in range(len(nums)):
            if nums[i] in dict1:
                return True
            dict1[nums[i]] = i
        return False        
       