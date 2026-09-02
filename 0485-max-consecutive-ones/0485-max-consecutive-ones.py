class Solution:
    def findMaxConsecutiveOnes(self, nums: List[int]) -> int:
        l,ans = 0,0

        for r,n in enumerate(nums):
            if n==0:
                l = r+1
            ans = max(ans,r-l+1)
        return ans        