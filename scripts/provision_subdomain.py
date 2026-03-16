#!/usr/bin/env python3
"""
Provision DNS subdomain records via deSEC.io API.

Uses only Python standard library (no external dependencies).

Example:
    python provision_subdomain.py \
        --token your_token_here \
        --domain your-domain.dedyn.io \
        --subname test.dev \
        --type A \
        --records 127.0.0.1 \
        --ttl 3600
"""

import argparse
import json
import urllib.request
import urllib.error
import sys


def parse_args():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description='Create DNS records via deSEC.io API',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  %(prog)s --token abc123 --domain example.dedyn.io --subname www --type A --records 192.168.1.1
  %(prog)s --token abc123 --domain example.dedyn.io --subname mail --type CNAME --records mail.example.com
  %(prog)s --token abc123 --domain example.dedyn.io --subname _acme-challenge --type TXT --records "challenge_value" --ttl 300
        '''
    )

    parser.add_argument(
        '-t', '--token',
        required=True,
        help='deSEC.io API token'
    )

    parser.add_argument(
        '-d', '--domain',
        required=True,
        help='Your registered domain (e.g., your-domain.dedyn.io)'
    )

    parser.add_argument(
        '-s', '--subname',
        required=True,
        help='Subdomain name (e.g., test.dev creates test.dev.your-domain.dedyn.io)'
    )

    parser.add_argument(
        '-y', '--type',
        dest='record_type',
        default='A',
        choices=['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'NS', 'SRV', 'CAA'],
        help='DNS record type (default: A)'
    )

    parser.add_argument(
        '-r', '--records',
        required=True,
        nargs='+',
        help='DNS record value(s) (space-separated for multiple)'
    )

    parser.add_argument(
        '-l', '--ttl',
        type=int,
        default=3600,
        help='Time to live in seconds (default: 3600)'
    )

    return parser.parse_args()


def create_desec_record(token, domain, subname, record_type, records, ttl):
    """
    Create a DNS record via deSEC.io API.

    Args:
        token: deSEC.io API token
        domain: Registered domain name
        subname: Subdomain to create
        record_type: DNS record type (A, AAAA, CNAME, etc.)
        records: List of record values
        ttl: Time to live in seconds

    Returns:
        bool: True if successful, False otherwise
    """
    url = f'https://desec.io/api/v1/domains/{domain}/rrsets/'

    headers = {
        'Authorization': f'Token {token}',
        'Content-Type': 'application/json',
    }

    data = json.dumps([{
        'subname': subname,
        'type': record_type,
        'records': records,
        'ttl': ttl,
    }]).encode('utf-8')

    try:
        req = urllib.request.Request(url, data=data, headers=headers, method='POST')

        with urllib.request.urlopen(req) as response:
            if response.status == 201:
                print(f"✓ Successfully created: {subname}.{domain}")
                return True
            else:
                print(f"✗ Unexpected status: {response.status}")
                return False

    except urllib.error.HTTPError as e:
        if e.code == 409:
            print(f"✗ Error: Record already exists (Conflict 409)")
        elif e.code == 401:
            print(f"✗ Error: Invalid API token (Unauthorized 401)")
        elif e.code == 404:
            print(f"✗ Error: Domain not found (404)")
        else:
            print(f"✗ HTTP Error {e.code}: {e.reason}")

        try:
            error_body = json.loads(e.read().decode('utf-8'))
            print(f"   Details: {error_body}")
        except (json.JSONDecodeError, UnicodeDecodeError):
            pass

        return False

    except urllib.error.URLError as e:
        print(f"✗ Network Error: {e.reason}")
        return False

    except Exception as e:
        print(f"✗ An error occurred: {e}")
        return False


def main():
    """Main entry point."""
    args = parse_args()

    print(f"Creating DNS record...")
    print(f"  Domain:   {args.domain}")
    print(f"  Subname:  {args.subname}")
    print(f"  Type:     {args.record_type}")
    print(f"  Records:  {', '.join(args.records)}")
    print(f"  TTL:      {args.ttl}s")
    print()

    success = create_desec_record(
        token=args.token,
        domain=args.domain,
        subname=args.subname,
        record_type=args.record_type,
        records=args.records,
        ttl=args.ttl
    )

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
