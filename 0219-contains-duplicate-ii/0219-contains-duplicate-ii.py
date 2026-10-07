class Solution:
    def containsNearbyDuplicate(self, nums: list[int], k: int) -> bool:
        n = len(nums)
        dict1 ={}
        for i in range(len(nums)):
            if nums[i] in dict1:
                if i-dict1[nums[i]]<=k:
                    return True
            dict1[nums[i]] = i
        return False            
           

            
        