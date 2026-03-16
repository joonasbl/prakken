# Create A record

```
python scripts/provision_subdomain.py \
 --token your_token_here \
 --domain prakken.dedyn.io \
 --subname test.dev \
 --type A \
 --records 192.168.1.1 \
 --ttl 3600
```

# Create CNAME record

```
python scripts/provision_subdomain.py \
 -t your_token_here \
 -d prakken.dedyn.io \
 -s www \
 -y CNAME \
 -r example.com
```

# Create TXT record (e.g., for ACME challenge)

```
python scripts/provision_subdomain.py \
 -t your_token_here \
 -d prakken.dedyn.io \
 -s \_acme-challenge \
 -y TXT \
 -r "challenge_value_here" \
 -l 300
```

# Multiple records (e.g., MX with backup)

```
python scripts/provision_subdomain.py \
 -t your_token_here \
 -d prakken.dedyn.io \
 -s "" \
 -y MX \
 -r "10 mail1.example.com" "20 mail2.example.com"
```
