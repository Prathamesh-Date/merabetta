import Link from "next/link";
import CareIcon from "../components/care-icon";
import CareShell from "../components/care-shell";

const notifications = [
  { icon: "heart", title: "Welcome to Merabetta", text: "Explore health essentials and lab tests chosen for everyday care.", time: "Today" },
  { icon: "lab", title: "Lab tests are available", text: "Compare nearby labs, packages and home sample collection options.", time: "Today" },
  { icon: "cart", title: "Your cart is ready", text: "Review your selected products and tests whenever you are ready.", time: "Earlier" },
];

export default function NotificationsPage() {
  return <CareShell><section className="ca-notifications" aria-labelledby="notifications-title">
    <header className="ca-notifications-heading"><div><span className="ca-eyebrow">Updates</span><h1 id="notifications-title">Notifications</h1><p>Stay informed about your orders, lab bookings and care updates.</p></div><Link className="ca-back" href="/profile">Back to profile <CareIcon name="arrow" size={17}/></Link></header>
    <div className="ca-notification-list">{notifications.map(item => <article className="ca-notification" key={item.title}><span className="ca-notification-icon"><CareIcon name={item.icon} size={24}/></span><div><h2>{item.title}</h2><p>{item.text}</p></div><time>{item.time}</time></article>)}</div>
    <aside className="ca-notification-note"><CareIcon name="bell" size={22}/><p>New updates will appear here when you place an order or book a lab test.</p></aside>
  </section></CareShell>;
}
