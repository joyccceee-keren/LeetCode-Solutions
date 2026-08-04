class Solution:
    def largestEven(self, s: str) -> str:
        last = s.rfind('2')

        if last == -1:
            return ""

        return s[:last + 1]            