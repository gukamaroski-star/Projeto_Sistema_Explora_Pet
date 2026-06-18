import imaplib
from email.utils import parsedate_to_datetime
from datetime import datetime, timezone, timedelta
import email

try:
    mail = imaplib.IMAP4_SSL("imap.gmail.com", 993, timeout=15)
    mail.login("explorapetoficial@gmail.com", "wwrbcjvyrtoiifee")
    status, folder_list = mail.list()
    sent_folder = '"[Gmail]/Sent Mail"'
    trash_folder = '"[Gmail]/Trash"'
    
    if status == 'OK':
        for folder_info in folder_list:
            info_str = folder_info.decode('utf-8')
            if '\\Sent' in info_str:
                parts = info_str.split(' "/" ')
                if len(parts) > 1:
                    sent_folder = parts[1]
            elif '\\Trash' in info_str:
                parts = info_str.split(' "/" ')
                if len(parts) > 1:
                    trash_folder = parts[1]

    # Select sent
    mail.select(sent_folder)
    res, data = mail.search(None, 'SUBJECT "Explora Pet"')
    if res == 'OK':
        email_ids = data[0].split()
        agora = datetime.now(timezone.utc)
        limite_1h = agora - timedelta(hours=1)
        
        for e_id in email_ids:
            status, msg_data = mail.fetch(e_id, '(BODY[HEADER.FIELDS (DATE SUBJECT)])')
            if status == 'OK' and msg_data[0]:
                header_content = msg_data[0][1].decode('utf-8')
                msg = email.message_from_string(header_content)
                subject = msg.get('Subject', '')
                date_str = msg.get('Date', '')
                
                decoded_subject_parts = email.header.decode_header(subject)
                decoded_subject = ""
                for part, encoding in decoded_subject_parts:
                    if isinstance(part, bytes):
                        decoded_subject += part.decode(encoding or 'utf-8')
                    else:
                        decoded_subject += part
                
                # Check if it is the recovery email
                subj_lower = decoded_subject.lower()
                if "recupera" in subj_lower and "senha" in subj_lower and "explora pet" in subj_lower:
                    try:
                        date_dt = parsedate_to_datetime(date_str)
                        if date_dt.tzinfo is None:
                            date_dt = date_dt.replace(tzinfo=timezone.utc)
                        
                        is_older_1h = date_dt < limite_1h
                        print(f"Sent Email ID {e_id.decode()}: Subject={decoded_subject}, Date={date_dt}, Older than 1h={is_older_1h}")
                    except Exception as e:
                        print("Error parsing date:", e)

    # Select trash
    mail.select(trash_folder)
    res, data = mail.search(None, 'SUBJECT "Explora Pet"')
    if res == 'OK':
        email_ids = data[0].split()
        agora = datetime.now(timezone.utc)
        limite_24h = agora - timedelta(hours=24)
        
        for e_id in email_ids:
            status, msg_data = mail.fetch(e_id, '(BODY[HEADER.FIELDS (DATE SUBJECT)])')
            if status == 'OK' and msg_data[0]:
                header_content = msg_data[0][1].decode('utf-8')
                msg = email.message_from_string(header_content)
                subject = msg.get('Subject', '')
                date_str = msg.get('Date', '')
                
                decoded_subject_parts = email.header.decode_header(subject)
                decoded_subject = ""
                for part, encoding in decoded_subject_parts:
                    if isinstance(part, bytes):
                        decoded_subject += part.decode(encoding or 'utf-8')
                    else:
                        decoded_subject += part
                
                subj_lower = decoded_subject.lower()
                if "recupera" in subj_lower and "senha" in subj_lower and "explora pet" in subj_lower:
                    try:
                        date_dt = parsedate_to_datetime(date_str)
                        if date_dt.tzinfo is None:
                            date_dt = date_dt.replace(tzinfo=timezone.utc)
                        
                        is_older_24h = date_dt < limite_24h
                        print(f"Trash Email ID {e_id.decode()}: Subject={decoded_subject}, Date={date_dt}, Older than 24h={is_older_24h}")
                    except Exception as e:
                        print("Error parsing date:", e)

    mail.logout()
except Exception as e:
    print("Error:", e)
