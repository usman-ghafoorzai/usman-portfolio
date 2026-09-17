import type { Profile } from "../domain/profile";

export const profile = {
    "name": "Usman Ghafoorzai",
    "professionalTitle": "Computer Engineer",
    "email": "usmangha@hotmail.com",
    "availabilityStatus": "Open to junior roles, projects and contract work",
    "links": {
        "github": "https://github.com/usman-ghafoorzai",
        "linkedin": "https://www.linkedin.com/in/usman-ghafoorzai/"
    }
} as const satisfies Profile;
