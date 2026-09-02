class Solution:
    def removeElement(self, nums: List[int], val: int) -> int:
        ans = 0

        for i in range(len(nums)):
            if nums[i] != val:
                nums[ans] = nums[i]
                ans += 1
        return ans        
       