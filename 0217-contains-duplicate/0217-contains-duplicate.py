class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        ans = set()

        for n in nums:
            if n in ans:
                return True
            ans.add(n)
        return False    

       