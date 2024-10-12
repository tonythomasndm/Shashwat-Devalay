import seeker_icon from "../../assets/seeker-icon.png"
import volunteer_icon from "../../assets/volunteer-icon.png"
import admin_icon from "../../assets/admin-icon.png"


export const Roles=[
    {title:"\u0938\u093E\u0927\u0915",iconURL:seeker_icon, mode:"Seeker"},
    {title:"\u0938\u094D\u0935\u092F\u0902\u0938\u0947\u0935\u0915", iconURL:volunteer_icon, mode:"Volunteer"},
    {title:"\u092A\u094D\u0930\u0936\u093E\u0938\u0915", iconURL:admin_icon, mode:"Admin"}
]

export const Services={
    "Seva": [
        "Medical",
        "Yoga",
        "Resource Generation",
        "Government Schemes",
        "Finance and Investment",
        "Legal Aid"
      ],
      "Shiksha": [
        "Teaching",
        "Supportive Education",
        "Dance",
        "Music"
      ],
      "Sanskar": [
        "Bhakti",
        "Kirtan",
        "Bhajan",
        "Intellectual Lectures",
        "Motivation",
        "Music"
      ],
      "Swarojgar": [
        "Skill Development",
        "Local Products"
      ]
}