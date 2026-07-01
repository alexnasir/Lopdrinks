"""User role constants.

Using a class of string constants (rather than an Enum) keeps the values
JSON-serialisable and directly comparable to database strings without any
conversion step.
"""


class Role:
    ADMIN: str = "Admin"
    USER: str = "User"

    ALL: tuple[str, ...] = (ADMIN, USER)
