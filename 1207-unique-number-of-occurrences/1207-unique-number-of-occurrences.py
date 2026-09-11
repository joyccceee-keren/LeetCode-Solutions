class Solution:
    def uniqueOccurrences(self, arr: List[int]) -> bool:
        dict1 = {}
        for nums in arr:
            if nums in dict1:
                dict1[nums] += 1
            else:
                dict1[nums] = 1

        occurrences = set()

        for count in dict1.values():
            if count in occurrences:
                return False
            occurrences.add(count)
        return True                    

        