class Solution:
    def reverseDegree(self, s: str) -> int:
        return sum(i * (26 -(ord(c) - 97)) for i, c in enumerate(s,1))
        