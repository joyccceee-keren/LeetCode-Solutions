class Solution:
    def sortArray(self, nums: List[int]) -> List[int]:
        if len(nums)<=1:
            return nums

        mid = len(nums) // 2

        left = self.sortArray(nums[:mid])
        right = self.sortArray(nums[mid:])

        ans = []
        i = 0
        j = 0

        while i<len(left) and j<len(right):
            if left[i]<right[j]:
                ans.append(left[i])
                i += 1
            else:
                ans.append(right[j])
                j += 1

        ans.extend(left[i:])
        ans.extend(right[j:])
        return ans        

       